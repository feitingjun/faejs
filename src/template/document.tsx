import { ReactElement } from 'react'

export default function Document({
  entry
}: {
  entry: ReactElement
}) {
  return (
    <html>
      <body>
        <div id='app'></div>
        {entry}
      </body>
    </html>
  )
}