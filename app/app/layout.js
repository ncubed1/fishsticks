import styles from "./styles/globals.css";

export const metadata = {
  title: 'Fishsticks',
  description: "it's just like real life!",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
