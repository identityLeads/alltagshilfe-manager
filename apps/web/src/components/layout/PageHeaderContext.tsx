import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface PageHeader {
  title: string;
  subtitle: string;
}

interface PageHeaderState extends PageHeader {
  setHeader: (header: PageHeader) => void;
}

const PageHeaderContext = createContext<PageHeaderState | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeader>({ title: "", subtitle: "" });
  return (
    <PageHeaderContext.Provider value={{ ...header, setHeader }}>{children}</PageHeaderContext.Provider>
  );
}

export function usePageHeaderState() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) throw new Error("usePageHeaderState must be used within PageHeaderProvider");
  return ctx;
}

export function usePageHeader(title: string, subtitle: string) {
  const { setHeader } = usePageHeaderState();
  useEffect(() => {
    setHeader({ title, subtitle });
  }, [title, subtitle, setHeader]);
}
