import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn/tabs"

export function HomeTabs() {
  const cardClass = "bg-surface-primary border border-border shadow-sm rounded-xl";
  const titleClass = "text-foreground font-semibold";
  const descClass = "text-foreground-muted";

  return (
    <Tabs defaultValue="B&Co" className="w-full flex flex-col gap-2">
      
      {/* We removed the hardcoded classes from the Triggers! */}
      <TabsList className="grid w-full grid-cols-4 h-auto p-1.5 bg-surface-secondary/50 rounded-lg border border-border">
        <TabsTrigger value="B&Co">B&Co</TabsTrigger>
        <TabsTrigger value="Content">Content</TabsTrigger>
        <TabsTrigger value="About">About</TabsTrigger>
        <TabsTrigger value="Contact">Contact</TabsTrigger>
      </TabsList>

      <TabsContent value="B&Co">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>B&Co</CardTitle>
            <CardDescription className={descClass}>
              Brighton and Co is a personal site made by Harry Brighton.
            </CardDescription>
          </CardHeader>
          <CardContent className={`text-sm ${descClass}`}>
            It is actively under development, with new features and content being implemented over time.
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="Content">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>Content</CardTitle>
            <CardDescription className={descClass}>
              This site uses a variety of content provided by Brighton and Co and other third-party providers.
            </CardDescription>
          </CardHeader>
          <CardContent className={`text-sm ${descClass}`}>
            Most images and media used on the site are content of Brighton and Co.
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="About">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>About</CardTitle>
            <CardDescription className={descClass}>
              This site is made purely as a hobby, and as a personal project in my free time.
            </CardDescription>
          </CardHeader>
          <CardContent className={`text-sm ${descClass}`}>
            As such, this site is not a commercial project, nor monetised in any way for any commercial purpose or gain.
          </CardContent>
          <CardContent className={`text-sm ${descClass}`}>
            You can find out more about the site on the <a href="/about" className="text-brand-700 hover:underline">About page</a>.
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="Contact">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className={titleClass}>Contact</CardTitle>
            <CardDescription className={descClass}>
              You can use the contact form on the <a href="/contact" className="text-brand-700 hover:underline">Contact page</a> if you have any questions or suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className={`text-sm ${descClass}`}>
            All communications are processed in a manner that is intended to be as secure as possible.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}