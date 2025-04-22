import next from '@next/eslint-plugin-next'
import typescript from '@typescript-eslint/eslint-plugin'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': next,
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      // Disable specific rules
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
      'no-constant-condition': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
] 