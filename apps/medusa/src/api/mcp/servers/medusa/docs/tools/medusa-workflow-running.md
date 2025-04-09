# Workflow Execution

This guide covers different patterns for executing workflows in Medusa.

## Basic Workflow Execution

Workflows are executed by invoking the workflow function and calling its `run()` method. You can pass input to the workflow as an argument to the `run()` method:

```typescript
const { result } = await myWorkflow(req.scope)
  .run({
    input: {
      name: "John"
    }
  })
```

## Executing Workflows in Medusa Resources

When running a workflow within a Medusa resource (like an API route, subscriber, scheduled job, or our MCP tools), you need to pass the Medusa container (typically `req.scope`) as an argument to the workflow function:

```typescript
const { result } = await myWorkflow(req.scope)
  .run({
    input: {
      name: req.query.name as string
    }
  })
```

## Executing Workflows Within Other Workflows

You can run one workflow within another using the `runAsStep()` method. This allows you to compose more complex workflows from simpler ones:

```typescript
const products = createProductsWorkflow.runAsStep({
  input: {
    products: [
      // ...
    ],
  },
})
```

This pattern is particularly useful when you need to:
- Break down complex operations into smaller, reusable workflows
- Maintain a clear separation of concerns
- Enable better error handling and rollback capabilities

Each workflow execution pattern serves different use cases and provides specific benefits for organizing your business logic effectively.
