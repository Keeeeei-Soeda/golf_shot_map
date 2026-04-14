import type { ReactNode } from 'react'

/** RSC のキャッシュ・プリフェッチ周りの不整合を避けやすくする */
export const dynamic = 'force-dynamic'

export default function SwingLayout({ children }: { children: ReactNode }) {
  return children
}
