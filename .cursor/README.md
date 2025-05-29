# Cursor Rules for Medusa Development

This directory contains comprehensive Cursor rules designed to enhance AI-assisted development for Medusa v2 applications. These rules provide context-aware suggestions and best practices for building scalable e-commerce applications.

## 📁 Rule Files Overview

### Core Development Rules

#### `medusa-development.mdc`
**Primary rule file for Medusa v2 backend development**
- Medusa v2 architectural patterns and conventions
- Module, service, and API route development
- Database models and repository patterns
- Workflow and subscriber implementations
- Security and validation best practices
- Performance optimization techniques

#### Remix Storefront Rules (Split for Better Organization)

**`remix-storefront-routing.mdc`**
- React Router v7 patterns and conventions
- Route structure and loader/action patterns
- Medusa SDK integration
- Form handling with @lambdacurry/forms
- API integration patterns

**`remix-storefront-components.mdc`**
- Component patterns and architecture
- Styling with Tailwind CSS
- Responsive design principles
- Reusable component patterns

**`remix-storefront-optimization.mdc`**
- Performance optimization and caching strategies
- SEO optimization and meta tag management
- Error handling and accessibility
- Testing patterns for components

#### `typescript-patterns.mdc`
**Advanced TypeScript patterns and best practices**
- Type definitions and interface design
- Generic types and utility types
- Error handling patterns
- Async programming patterns
- Functional programming concepts
- Testing type definitions

#### Testing Rules (Split by Testing Type)

**`testing-patterns-unit.mdc`**
- Unit testing for services and components
- Service layer testing patterns
- React component testing
- Hook testing patterns

**`testing-patterns-integration.mdc`**
- Integration testing for APIs and databases
- Workflow testing
- Database integration patterns

**`testing-patterns-e2e.mdc`**
- End-to-end testing with Playwright
- Storefront user journey testing
- Test utilities and factories
- Mocking strategies and best practices

#### `remix-hook-form-migration.mdc`
**Migration guide from remix-validated-form to @lambdacurry/forms**
- Form validation patterns (Yup to Zod)
- Component migration examples
- Error handling updates
- Response handling patterns

## 🚀 Getting Started

### Prerequisites
- Cursor IDE installed
- Medusa v2 project setup
- TypeScript configuration

### Activation
These rules are automatically applied based on file patterns:
- `.mdc` files in `.cursor/rules/` are automatically loaded
- Rules apply to specific file patterns defined in each rule's `globs` section
- `alwaysApply: true` ensures rules are active for matching files

### File Pattern Targeting

| Rule File | Target Files |
|-----------|-------------|
| `medusa-development.mdc` | `apps/medusa/**/*.ts`, `apps/medusa/**/*.tsx` |
| `remix-storefront-routing.mdc` | `apps/storefront/**/*.ts`, `apps/storefront/**/*.tsx` |
| `remix-storefront-components.mdc` | `apps/storefront/**/*.ts`, `apps/storefront/**/*.tsx` |
| `remix-storefront-optimization.mdc` | `apps/storefront/**/*.ts`, `apps/storefront/**/*.tsx` |
| `typescript-patterns.mdc` | `**/*.ts`, `**/*.tsx` |
| `testing-patterns-unit.mdc` | `**/*.test.ts`, `**/*.spec.ts`, `**/__tests__/**/*` |
| `testing-patterns-integration.mdc` | `**/*.test.ts`, `**/*.spec.ts`, `**/__tests__/**/*` |
| `testing-patterns-e2e.mdc` | `**/*.test.ts`, `**/*.spec.ts`, `**/__tests__/**/*` |
| `remix-hook-form-migration.mdc` | All TypeScript files (migration context) |

## 🎯 Key Features

### Medusa v2 Specific Guidance
- **Module Development**: Patterns for creating custom Medusa modules
- **Service Layer**: Dependency injection and business logic patterns
- **API Routes**: RESTful endpoint development for admin and store APIs
- **Database Integration**: Model definitions and repository patterns
- **Event-Driven Architecture**: Subscribers and workflow implementations

### React/Remix Best Practices
- **Component Architecture**: Reusable component patterns
- **State Management**: Cart management with Zustand
- **Form Handling**: Modern form patterns with react-hook-form
- **Performance**: Code splitting, image optimization, caching strategies
- **SEO**: Meta tags, structured data, accessibility

### TypeScript Excellence
- **Type Safety**: Advanced type patterns and utility types
- **Error Handling**: Result patterns and custom error types
- **Async Patterns**: Promise utilities and async iterators
- **Testing**: Type-safe testing patterns and mock utilities

## 🛠️ Usage Examples

### Creating a New Medusa Service
When creating a new service file in `apps/medusa/src/services/`, Cursor will suggest:

```typescript
import { MedusaService } from "@medusajs/framework/utils"

class MyService extends MedusaService({
  MyModel,
}) {
  async create(data: CreateMyEntityInput): Promise<MyEntity> {
    return await this.myModelRepository_.create(data)
  }
}
```

### Building React Components
When working in `apps/storefront/app/components/`, Cursor will suggest:

```typescript
interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  // Component implementation with proper TypeScript and accessibility
}
```

### Writing Tests
When creating test files, Cursor will suggest proper testing patterns:

```typescript
describe("UserService", () => {
  let container: MedusaContainer
  let userService: UserService

  beforeEach(() => {
    container = createMedusaContainer()
    userService = container.resolve("userService")
  })

  it("should create a new user with valid data", async () => {
    // Arrange, Act, Assert pattern
  })
}
```

## 📚 Best Practices Enforced

### Code Quality
- ✅ Strict TypeScript usage
- ✅ Proper error handling
- ✅ Input validation with Zod
- ✅ Comprehensive testing
- ✅ Performance optimization

### Architecture
- ✅ Modular design patterns
- ✅ Dependency injection
- ✅ Event-driven architecture
- ✅ RESTful API design
- ✅ Database best practices

### Security
- ✅ Input sanitization
- ✅ Authentication patterns
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ SQL injection prevention

## 🔧 Customization

### Adding Custom Rules
1. Create a new `.mdc` file in `.cursor/rules/`
2. Define the rule metadata:
   ```yaml
   ---
   description: Your custom rule description
   globs: 
     - "path/to/target/files/**/*.ts"
   alwaysApply: true
   ---
   ```
3. Add your custom guidance and patterns

### Modifying Existing Rules
- Edit the relevant `.mdc` file
- Rules are automatically reloaded by Cursor
- Test changes with relevant file types

## 🎨 Integration with Development Workflow

### With Medusa CLI
These rules complement Medusa CLI commands:
- `medusa develop` - Rules provide guidance during development
- `medusa build` - Rules ensure production-ready code patterns
- `medusa db:migrate` - Rules suggest proper migration patterns

### With Package Scripts
Rules enhance development with existing scripts:
- `yarn dev` - Real-time guidance during development
- `yarn build` - Production build optimization suggestions
- `yarn test` - Testing pattern recommendations
- `yarn typecheck` - TypeScript best practice enforcement

## 📖 Learning Resources

### Official Documentation
- [Medusa v2 Documentation](https://docs.medusajs.com/)
- [React Router v7 Documentation](https://reactrouter.com/)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)

### Code Examples
Each rule file contains extensive code examples demonstrating:
- Common patterns and anti-patterns
- Best practice implementations
- Error handling strategies
- Performance optimization techniques

## 🤝 Contributing

### Improving Rules
1. Identify areas for improvement in existing rules
2. Add new patterns based on project experience
3. Update examples with real-world scenarios
4. Ensure rules stay current with framework updates

### Feedback
- Report issues with rule suggestions
- Suggest new patterns or improvements
- Share successful implementations

## 📝 Maintenance

### Regular Updates
- Keep rules synchronized with Medusa v2 updates
- Update React Router patterns as the framework evolves
- Refresh TypeScript patterns with new language features
- Maintain testing patterns with latest testing library updates

### Version Compatibility
- Rules are designed for Medusa v2.7.0+
- React Router v7 compatibility
- TypeScript 5.6+ features
- Node.js 20+ patterns

---

These Cursor rules are designed to accelerate development while maintaining code quality and consistency across the Medusa application. They serve as an intelligent coding assistant, providing contextual guidance based on the specific file and framework being used.
