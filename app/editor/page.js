import { Suspense } from "react";
import Editor from "../../components/Editor";

export const metadata = {
  title: "Editor — Papelera",
};

export default function EditorPage() {
  return (
    <Suspense fallback={<main style={{ padding: 40 }}>Cargando editor…</main>}>
      <Editor />
    </Suspense>
  );
}
