# TypeScript Build Troubleshooting Guide

This document contains solutions to common TypeScript build errors in this Nuxt 3 project.

## Common Build Errors

### 1. Property Does Not Exist on Type

**Error:**
```
error TS2339: Property 'someProperty' does not exist on type 'SomeType'
```

**Cause:** TypeScript cannot infer the type of objects, especially when using `ref()` without explicit types.

**Solution:** Always define interfaces and explicitly type your refs:

```typescript
// ❌ BAD - TypeScript can't infer types
const data = ref({
  id: 1,
  name: 'Test'
})

// ✅ GOOD - Explicit interface and type
interface DataType {
  id: number
  name: string
  optionalProp?: string  // Use ? for optional properties
}

const data = ref<DataType>({
  id: 1,
  name: 'Test'
})
```

### 2. Never Type on Arrays

**Error:**
```
error TS2339: Property 'x' does not exist on type 'never'
```

**Cause:** Array refs without explicit typing default to `never[]` type.

**Solution:** Always type array refs:

```typescript
// ❌ BAD
const items = ref([])

// ✅ GOOD
interface Item {
  id: number
  name: string
}

const items = ref<Item[]>([])
```

### 3. Inline Style Attributes with Complex Data URLs

**Error:**
```
error TS1005: ':' expected
```

**Cause:** Complex escaped strings in inline `style` attributes can confuse the TypeScript parser.

**Solution:** Move background images to Tailwind config or CSS classes:

```vue
<!-- ❌ BAD -->
<div style="background-image: url('data:image/svg+xml,...lots of escaped chars...')"></div>

<!-- ✅ GOOD -->
<div class="bg-pattern"></div>
```

```typescript
// tailwind.config.ts
backgroundImage: {
  'pattern': "url('data:image/svg+xml;base64,PHN2Zy4uLg==')"
}
```

## Pre-Deployment Checklist

Before pushing to Vercel, **always run local build**:

```bash
pnpm run build
```

This will catch TypeScript errors before deployment fails.

## Quick Fixes

### For New Components/Pages:

1. **Define all interfaces at the top of `<script setup>`**
2. **Explicitly type all refs, especially objects and arrays**
3. **Use optional properties (`?`) for properties that might not exist**
4. **Avoid complex inline styles - use classes instead**

### Example Template:

```vue
<script setup lang="ts">
// 1. Define interfaces first
interface MyData {
  id: string
  name: string
  optional?: string
}

interface MyItem {
  id: number
  value: string
}

// 2. Type all refs explicitly
const data = ref<MyData>({
  id: '1',
  name: 'Test'
})

const items = ref<MyItem[]>([])

// 3. Type function parameters and returns
function processItem(item: MyItem): string {
  return item.value
}
</script>
```

## TypeScript Configuration

This project uses **strict TypeScript**:

```typescript
// nuxt.config.ts
typescript: {
  strict: true,
  typeCheck: true
}
```

This means:
- All types must be explicitly defined
- No implicit `any` types
- Strict null checks enabled
- Build will fail on any TypeScript error

## When You See Build Errors:

1. **Read the error carefully** - it tells you the file and line number
2. **Check if types are defined** - add interfaces if missing
3. **Look for `ref()` without types** - add `ref<Type>()`
4. **Check for inline complex strings** - move to config/CSS
5. **Test locally** with `pnpm run build` before pushing
6. **Fix all errors** - partial fixes won't work

## Common Patterns in This Project:

### Asset/Comment Data:
```typescript
interface Asset {
  id: string
  title: string
  type: 'video' | 'image'  // Use union types for specific values
  videoUrl?: string        // Optional properties
  imageUrl?: string
}

const asset = ref<Asset>({ /* ... */ })
```

### Router Navigation:
```typescript
// Get route params
const route = useRoute()
const id = route.params.id  // Type is string | string[]

// Navigate programmatically
navigateTo(`/path/${id}`)
```

### Event Handlers:
```typescript
const videoPlayer = ref<HTMLVideoElement>()

function onVideoLoaded() {
  if (videoPlayer.value) {  // Always check .value exists
    duration.value = videoPlayer.value.duration
  }
}
```

## Prevention

To avoid these errors in the future:

1. ✅ **Always define interfaces for complex objects**
2. ✅ **Type all refs explicitly: `ref<Type>()`**
3. ✅ **Test build locally before pushing**
4. ✅ **Use TypeScript features (interfaces, types, unions)**
5. ✅ **Keep complex data/styles in config files, not inline**

## Help

If you encounter a new TypeScript error not covered here:

1. Run `pnpm run build` locally
2. Read the full error message
3. Check the line number and file
4. Add proper type definitions
5. Document the solution here for future reference
