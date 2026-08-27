/**
 * Expo generates `expo-env.d.ts` with this same reference, but that file is
 * gitignored on Expo's own instruction, so it does not exist on a fresh
 * checkout — which is where CI type-checks. `expo/types` is what declares the
 * side-effect CSS import in app/_layout.tsx; TypeScript 6 errors on it
 * (TS2882) without a declaration.
 *
 * A duplicate reference alongside the generated file is harmless.
 */
/// <reference types="expo/types" />
