const { readFile, writeFile, mkdir } = require('fs/promises');
const { resolve } = require('path');

async function copyPackageJson() {
  const baseDir = resolve(__dirname, '..');
  const distDir = resolve(baseDir, 'dist');
  try {
    await mkdir(distDir, { recursive: true });

    // Read the original package.json
    const packageJsonPath = resolve(baseDir, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    // Add required properties for node-pre-gyp (bcrypt)
    packageJson.main = packageJson.main || 'main.js';
    packageJson.binary = packageJson.binary || {
      module_name: 'bcrypt_lib',
      module_path: './lib/binding/napi-v3',
      remote_path: './{module_name}/v{version}/{configuration}/',
      package_name: '{module_name}-v{version}-{node_abi}-{platform}-{libc}-{arch}.tar.gz',
      host: 'https://github.com/kelektiv/node.bcrypt.js/releases/download/'
    };

    // Write the modified package.json to dist
    const destPath = resolve(distDir, 'package.json');
    await writeFile(destPath, JSON.stringify(packageJson, null, 2));

    console.log('✅ Created modified package.json in dist/package.json');
  } catch (error) {
    console.error('⚠️  Could not create package.json in dist:', error);
    process.exit(1);
  }
}

copyPackageJson();

