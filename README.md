# healthpal-platform-api
# 1) Clone the repository
git clone https://github.com/AliDawood55/healthpal-platform-api.git
cd healthpal-platform-api

# 2) Install dependencies (uses the exact versions from package-lock.json)
npm ci
# (Alternative if you don’t want to use ci)
# npm install

# 3) Enable Husky (if defined in package.json)
npm run prepare || npx husky init

