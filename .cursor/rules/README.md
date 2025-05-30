# Cursor Rules for Medusa2 Starter

This directory contains comprehensive cursor rules for the Medusa2 starter project, designed to ensure consistent code quality, architectural patterns, and development practices across the entire codebase.

## 📁 Rule Organization

Our cursor rules are organized following best practices for maintainability and clarity:

```
.cursor/rules/
├── medusa-backend.mdc          # Backend API, modules, workflows
├── medusa-admin.mdc            # Admin UI components and patterns  
├── typescript-patterns.mdc     # TypeScript conventions
├── remix-hook-form-migration.mdc # Form migration patterns
└── README.md                   # This file
```

## 🎯 Rule Categories

### 1. **Medusa Backend** (`medusa-backend.mdc`)
**Scope**: `apps/medusa/src/api/**/*`, `apps/medusa/src/modules/**/*`, `apps/medusa/src/workflows/**/*`

Covers:
- API endpoint patterns and structure
- Module development (models, services, migrations)
- Workflow and step implementation
- Database patterns and migrations
- Type definitions for backend APIs
- Security and validation patterns
- Performance optimization
- Testing strategies

**Key Patterns**:
- Workflow-first architecture for business logic
- Consistent API response structures
- Proper error handling and rollback mechanisms
- Type-safe service resolution from container

### 2. **Medusa Admin** (`medusa-admin.mdc`)
**Scope**: `apps/medusa/src/admin/**/*`

Covers:
- React component architecture and composition
- Custom hooks with TanStack Query
- Form handling with React Hook Form
- State management patterns
- UI component usage (Medusa UI)
- Routing and navigation
- Performance optimization
- Accessibility best practices

**Key Patterns**:
- Controlled form components with proper typing
- Consistent list item and sidebar components
- Declarative state management
- Proper error handling with toast notifications

### 3. **TypeScript Patterns** (`typescript-patterns.mdc`)
**Scope**: `**/*.ts`, `**/*.tsx`

Covers:
- Strict type safety practices
- Interface and type definitions
- Generic patterns and constraints
- Utility type usage
- Error handling types
- React component typing
- Module declarations
- Testing type utilities

**Key Patterns**:
- Branded types for ID safety
- Result pattern for error handling
- Proper generic constraints
- Type-only imports

### 4. **Form Migration** (`remix-hook-form-migration.mdc`)
**Scope**: Form-related files during migration

Covers:
- Migration from remix-validated-form to @lambdacurry/forms
- Yup to Zod schema conversion
- React Hook Form integration patterns
- Error handling updates
- Response structure changes

## 🚀 Usage Guidelines

### Automatic Application
Most rules are set to `alwaysApply: true` and will automatically activate based on file patterns (globs). This ensures consistent application across the codebase.

### Manual Application
For specific contexts or when working on particular features, you can manually attach rules using Cursor's rule selection interface.

### Rule Priority
When multiple rules apply to the same file:
1. More specific rules (narrower globs) take precedence
2. Feature-specific rules override general patterns
3. TypeScript patterns apply broadly but defer to framework-specific rules

## 🎨 Best Practices Enforced

### Code Quality
- ✅ Strict TypeScript usage with no `any` types
- ✅ Comprehensive error handling
- ✅ Consistent naming conventions
- ✅ Proper component composition
- ✅ Type-safe API interactions

### Architecture
- ✅ Workflow-based backend operations
- ✅ Modular component design
- ✅ Separation of concerns
- ✅ Consistent state management
- ✅ Proper abstraction layers

### Performance
- ✅ Optimized React components with memo/useMemo
- ✅ Efficient database queries
- ✅ Proper caching strategies
- ✅ Lazy loading and code splitting

### Security
- ✅ Input validation with Zod schemas
- ✅ Authenticated request handling
- ✅ Proper error message sanitization
- ✅ Type-safe API boundaries

## 🔧 Maintenance

### Regular Updates
These rules should be updated when:
- Framework versions change (Medusa, React, etc.)
- New architectural patterns are established
- Team conventions evolve
- New best practices emerge

### Testing Rules
Periodically test rules with:
- Diverse code generation prompts
- Edge case scenarios
- New feature development
- Refactoring operations

### Quality Assurance
Monitor generated code for:
- Adherence to established patterns
- Proper error handling
- Type safety compliance
- Performance considerations

## 📚 Related Documentation

- [Medusa v2 Documentation](https://docs.medusajs.com/v2)
- [React Hook Form Guide](https://react-hook-form.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Medusa UI Components](https://ui.medusajs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

When adding or modifying rules:

1. **Follow the established structure** with proper YAML frontmatter
2. **Include concrete examples** for both correct and incorrect patterns
3. **Test thoroughly** with various prompts and scenarios
4. **Update this README** when adding new rule categories
5. **Consider rule interactions** and potential conflicts

### Rule Quality Checklist
- [ ] Clear description and scope definition
- [ ] Proper glob patterns for file targeting
- [ ] Concrete code examples with explanations
- [ ] Edge case handling
- [ ] Integration with existing rules
- [ ] Performance considerations
- [ ] Security implications

## 🎯 Goals

These cursor rules aim to:

1. **Accelerate Development**: Reduce decision fatigue with clear patterns
2. **Ensure Consistency**: Maintain uniform code quality across the team
3. **Prevent Common Mistakes**: Catch anti-patterns before they enter the codebase
4. **Facilitate Onboarding**: Help new team members understand established conventions
5. **Support Scalability**: Ensure patterns work well as the codebase grows

## 📈 Success Metrics

Effective cursor rules should result in:
- Faster feature development
- Fewer code review comments on patterns/style
- More consistent codebase architecture
- Reduced debugging time
- Improved code maintainability

---

*Last updated: May 29, 2025*
*For questions or suggestions, please reach out to the development team.*

