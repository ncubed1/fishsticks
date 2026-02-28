// unused

import "./styles/globals.css";

export const metadata = {
  title: 'Fishsticks',
  description: "It's just like real life!",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
