export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'astro/zod';
import { Resend } from 'resend';

// ✅ Astro v6 standard for Cloudflare variables
// @ts-ignore - Suppressing TS error in case Cloudflare types aren't configured in your tsconfig
import { env } from 'cloudflare:workers';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email('Please enter a valid email address'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  honeypot: z.string().max(0), // Anti-spam: must be empty
});

// We can remove 'locals' from here now!
export const POST: APIRoute = async ({ request }) => {
  try {
    // ✅ Use the new Cloudflare env import, with a fallback for local development
    const apiKey = env?.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("Resend API key is missing. Check Cloudflare environment variables.");
    }

    const resend = new Resend(apiKey);
    
    const formData = await request.formData();

    const data = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      subject: formData.get('subject')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      honeypot: formData.get('honeypot')?.toString() || '',
    };

    // Validate
    const result = contactSchema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const error of result.error.issues) {
        const field = error.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      }

      return new Response(
        JSON.stringify({
          success: false,
          errors: fieldErrors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Honeypot check (bot detection)
    if (result.data.honeypot) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send the email via Resend
    const emailResult = await resend.emails.send({
      from: 'Contact Form <web@contact.bandco.uk>', 
      to: ['form-enquiries@web.bandco.uk'],
      replyTo: result.data.email, 
      subject: `Website Enquiry: ${result.data.subject || 'No Subject'}`,
      html: `
        <h2>New Website Enquiry</h2>
        <p><strong>Name:</strong> ${result.data.name}</p>
        <p><strong>Email:</strong> ${result.data.email}</p>
        <p><strong>Subject:</strong> ${result.data.subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${result.data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Check if Resend rejected the email
    if (emailResult.error) {
      console.error('Resend API Error:', emailResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          errors: { form: [emailResult.error.message || 'Failed to send email. Please try again.'] },
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Success!
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Contact form error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        errors: { form: [error?.message || 'An unexpected error occurred'] },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};