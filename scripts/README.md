# Scripts Directory

Utility scripts for Agency Dashboard OS maintenance and development.

## Available Scripts

### 🔍 `verify-schema.js` - Database Schema Verification

Verifies that your Supabase database schema matches the documented schema in `DATABASE_SCHEMA.md`.

**Usage:**
```bash
node scripts/verify-schema.js
```

**What it checks:**
- All 30 expected tables exist
- Tables are accessible (RLS policies working)
- Displays row counts for each table

**Example Output:**
```
🔍 Verifying Supabase Schema...

✅ profiles - Accessible (0 rows)
✅ clients - Accessible (0 rows)
✅ requests - Accessible (2 rows)
✅ video_assets - Accessible (0 rows)
...

============================================================
📊 Summary:
============================================================
✅ Accessible tables: 30
⚠️  Existing (no access): 0
❌ Missing tables: 0
📋 Total expected: 30
```

**When to run:**
- After applying new migrations
- Before deploying to production
- When troubleshooting database issues
- As part of CI/CD pipeline

**Requirements:**
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables
- `@supabase/supabase-js` package installed

---

## Adding New Scripts

When adding a new script:

1. **Document it here** with usage instructions
2. **Add executable permission** if it's a shell script:
   ```bash
   chmod +x scripts/your-script.sh
   ```
3. **Include error handling** and helpful output messages
4. **Test thoroughly** before committing

---

## Script Naming Conventions

- Use kebab-case: `verify-schema.js`, `sync-slack.js`
- Prefix with action verb: `verify-`, `sync-`, `migrate-`, `cleanup-`
- Add `.js` extension for Node scripts, `.sh` for bash scripts

---

## Environment Variables

All scripts should read from environment variables via:
- `.env` file (using `dotenv` package)
- Process environment variables
- Never hardcode credentials

**Example:**
```javascript
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing required environment variable')
  process.exit(1)
}
```
