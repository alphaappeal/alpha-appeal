const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

const checks = [
    {
        name: 'Supabase Client Consolidation',
        check: () => {
            const newClientExists = fs.existsSync(path.join(srcDir, 'lib/supabase.ts'));
            // The old client might still exist if I didn't delete it, but it shouldn't be imported.
            // Let's check imports in App.tsx
            const appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
            const usesNewClient = !appContent.includes('integrations/supabase/client');

            return newClientExists && usesNewClient ? 'PASS' : 'FAIL';
        }
    },
    {
        name: 'Global Context Providers',
        check: () => {
            const authContext = fs.existsSync(path.join(srcDir, 'context/AuthContext.tsx'));
            const cartContext = fs.existsSync(path.join(srcDir, 'context/CartContext.tsx'));
            return authContext && cartContext ? 'PASS' : 'FAIL';
        }
    },
    {
        name: 'Primary Color (Sage Green)',
        check: () => {
            const cssContent = fs.readFileSync(path.join(srcDir, 'index.css'), 'utf-8');
            // Sage Green HSL: 103 22% 56%
            return cssContent.includes('103 22% 56%') ? 'PASS' : 'FAIL';
        }
    },
    {
        name: 'Review Components',
        check: () => {
            const list = fs.existsSync(path.join(srcDir, 'components/reviews/ReviewList.tsx'));
            const form = fs.existsSync(path.join(srcDir, 'components/reviews/ReviewForm.tsx'));
            return list && form ? 'PASS' : 'FAIL';
        }
    },
    {
        name: 'Product Details Refactor',
        check: () => {
            const content = fs.readFileSync(path.join(srcDir, 'pages/ProductDetail.tsx'), 'utf-8');
            // Should use ID params
            const usesId = content.includes('useParams<{ id: string }>()');
            // Should import ReviewList
            const importsReviews = content.includes('components/reviews/ReviewList');
            return usesId && importsReviews ? 'PASS' : 'FAIL';
        }
    }
];

console.log('--- Verification Report ---');
let allPassed = true;
checks.forEach(c => {
    try {
        const result = c.check();
        console.log(`[${result}] ${c.name}`);
        if (result === 'FAIL') allPassed = false;
    } catch (e) {
        console.log(`[ERROR] ${c.name}: ${e.message}`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\nAll checks passed successfully.');
    process.exit(0);
} else {
    console.log('\nSome checks failed.');
    process.exit(1);
}
