import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import Home from './pages/Home';
import Product from './pages/Product';
import HowItWorks from './pages/HowItWorks';
import UseCases from './pages/UseCases';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const DashboardLayout = lazy(() => import('./dashboard/DashboardLayout'));
const Overview = lazy(() => import('./dashboard/Overview'));
const Zones = lazy(() => import('./dashboard/Zones'));
const ZoneDetail = lazy(() => import('./dashboard/ZoneDetail'));
const Observations = lazy(() => import('./dashboard/Observations'));
const Irrigation = lazy(() => import('./dashboard/Irrigation'));
const InspectionQueue = lazy(() => import('./dashboard/InspectionQueue'));
const Reports = lazy(() => import('./dashboard/Reports'));
const Team = lazy(() => import('./dashboard/Team'));
const Settings = lazy(() => import('./dashboard/Settings'));

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted" role="status">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="product" element={<Product />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="use-cases" element={<UseCases />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="zones" element={<Zones />} />
          <Route path="zones/:zoneId" element={<ZoneDetail />} />
          <Route path="observations" element={<Observations />} />
          <Route path="irrigation" element={<Irrigation />} />
          <Route path="inspections" element={<InspectionQueue />} />
          <Route path="reports" element={<Reports />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound inDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
