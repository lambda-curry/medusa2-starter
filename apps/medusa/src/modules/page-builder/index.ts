import { Module } from '@medusajs/framework/utils'

import PageBuilderService from './service'

export const PAGE_BUILDER_MODULE = 'page-builder'

export const pageBuilderModuleEvents = Object.freeze({
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
})

export default Module(PAGE_BUILDER_MODULE, {
  service: PageBuilderService,
})
