import jsxRuntime from 'react/jsx-runtime';
import jsxDevRuntime from 'react/jsx-dev-runtime';
import { autoFixContext } from 'react-activation';

// 修复react-activation对context的破坏性影响
autoFixContext(
  [jsxRuntime, 'jsx', 'jsxs', 'jsxDEV'],
  [jsxDevRuntime, 'jsx', 'jsxs', 'jsxDEV']
)