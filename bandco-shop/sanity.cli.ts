import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '63lsf8co',
    dataset: 'shop-dataset1'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
