import { Sprout } from 'lucide-react';
import { ButtonLink } from '../components/ui';
import { usePageMeta } from '../lib/usePageMeta';

export default function NotFound({ inDashboard = false }: { inDashboard?: boolean }) {
  usePageMeta('Page not found');
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <Sprout className="h-10 w-10 text-sage-500" aria-hidden="true" />
      <h1 className="mt-4 text-4xl text-forest-900">Nothing growing here.</h1>
      <p className="mt-3 max-w-md text-muted">The page you were looking for doesn’t exist or has moved.</p>
      <ButtonLink to={inDashboard ? '/dashboard' : '/'} className="mt-8">
        {inDashboard ? 'Back to overview' : 'Back to home'}
      </ButtonLink>
    </div>
  );
}
