import "./globals.css";

export const metadata = {
  title: "Papelera — cartas digitales con alma de papel",
  description:
    "Crea tarjetas digitales con textura de papel, tipografías manuscritas y stickers. Personaliza sin límites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=Caveat:wght@400;600;700&family=Patrick+Hand&family=Kalam:wght@300;400;700&family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Shadows+Into+Light&family=Gaegu:wght@300;400;700&family=Amatic+SC:wght@400;700&family=Parisienne&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
