import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  UserRoundPlus,
  Sparkles,
  Archive,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/schedule', label: '课程排期', icon: CalendarDays },
  { to: '/waiting', label: '候补补位', icon: UserRoundPlus },
  { to: '/recommend', label: '多维推荐', icon: Sparkles },
  { to: '/archive', label: '撮合归档', icon: Archive },
];

const breadcrumbMap: Record<string, string> = {
  dashboard: '仪表盘',
  schedule: '课程排期',
  waiting: '候补补位',
  recommend: '多维推荐',
  archive: '撮合归档',
};

export default function Layout({ children }: LayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentCrumb = pathSegments[0] ? breadcrumbMap[pathSegments[0]] || pathSegments[0] : '';

  const SidebarContent = (
    <nav className="flex h-full w-full flex-col border-r border-ink/10 bg-white">
      <div className="flex h-16 items-center justify-center border-b border-ink/10 px-4">
        <div
          className={cn(
            'flex items-center gap-2 transition-all duration-300',
            !expanded && !isMobile && 'justify-center',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cinnabar text-white font-serif font-bold">
            书
          </div>
          {(expanded || isMobile) && (
            <span className="whitespace-nowrap text-lg font-semibold text-ink">书法排课系统</span>
          )}
        </div>
      </div>

      <ul className="flex-1 space-y-1 p-3">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-cinnabar/10 text-cinnabar'
                    : 'text-ink/60 hover:bg-rice hover:text-ink',
                  !expanded && !isMobile && 'justify-center',
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(expanded || isMobile) && <span className="whitespace-nowrap">{label}</span>}
              {(expanded || isMobile) && (
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-rice">
      <div
        className={cn(
          'hidden shrink-0 transition-all duration-300 ease-in-out lg:block',
          expanded ? 'w-60' : 'w-16',
        )}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => !isMobile && setExpanded(false)}
      >
        {SidebarContent}
      </div>

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 transform bg-white shadow-2xl transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-ink/60 hover:bg-rice hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
        {SidebarContent}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink/10 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-ink/60 hover:bg-rice hover:text-ink lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <nav className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 text-ink/40 hover:text-cinnabar transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">首页</span>
              </button>
              {currentCrumb && (
                <>
                  <ChevronRight className="h-4 w-4 text-ink/20" />
                  <span className="font-medium text-ink">{currentCrumb}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
              <input
                type="text"
                placeholder="搜索课程、学员、教师..."
                className="w-56 md:w-72 rounded-lg border border-ink/10 bg-rice/50 py-2 pl-10 pr-4 text-sm text-ink placeholder:text-ink/30 focus:border-cinnabar/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cinnabar/10 transition-all"
              />
            </div>
            <button
              className="relative rounded-lg p-2 text-ink/60 hover:bg-rice hover:text-ink transition-colors"
              aria-label="通知"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cinnabar ring-2 ring-white" />
            </button>
          </div>
        </header>

        <main
          className="flex-1 overflow-auto"
          style={{
            backgroundColor: '#f5f0e1',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(212, 160, 23, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(45, 90, 61, 0.04) 0%, transparent 50%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")
            `,
            backgroundSize: 'auto, auto, 200px 200px',
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
