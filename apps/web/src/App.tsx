import { Route, Routes } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Layout } from "./components/layout/Layout";
import { SignInPage } from "./pages/SignInPage";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { CustomerList } from "./pages/customers/CustomerList";
import { CustomerDetail } from "./pages/customers/CustomerDetail";
import { InsurerList } from "./pages/insurers/InsurerList";
import { ServiceList } from "./pages/services/ServiceList";
import { InvoiceList } from "./pages/invoices/InvoiceList";
import { StaffList } from "./pages/staff/StaffList";
import { TourPlanning } from "./pages/tours/TourPlanning";

function ProtectedApp() {
  return (
    <>
      <SignedIn>
        <Layout />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} signInUrl="/sign-in">
      <Routes>
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route element={<ProtectedApp />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kunden" element={<CustomerList />} />
          <Route path="/kunden/:id" element={<CustomerDetail />} />
          <Route path="/kostentraeger" element={<InsurerList />} />
          <Route path="/leistungskatalog" element={<ServiceList />} />
          <Route path="/rechnungen" element={<InvoiceList />} />
          <Route path="/rechnungen/:id" element={<InvoiceList />} />
          <Route path="/mitarbeiter" element={<StaffList />} />
          <Route path="/touren" element={<TourPlanning />} />
        </Route>
      </Routes>
    </ClerkProvider>
  );
}
