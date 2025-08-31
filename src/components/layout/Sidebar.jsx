
import { useEffect,useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, Users, Settings, Folder, Shield } from 'lucide-react';
import axios from 'axios';
import DarkModeToggle from './DarkModeToggle';

export default function Sidebar({ openMobile, onCloseMobile }) {
  const [openMenu, setOpenMenu] = useState({});
    const [menus, setMenus] = useState([]);
  const [dark, setDark] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch all menus
    axios.get('https://apinewapp.onrender.com/api/menus', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(res => setMenus(res.data))
      .catch(err => console.error(err));

    // Fetch current user roles and permissions
    axios.get('https://apinewapp.onrender.com/api/userMe', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(res => {
      const perms = res.data.roles.reduce((acc, role) => {
        return [...acc, ...(role.permissions || [])];
      }, []);
      setUserPermissions(perms);
    }).catch(err => console.error(err));
  }, [token]);

  const toggle = (key) => setOpenMenu(s => ({ ...s, [key]: !s[key] }));
  const ItemIcon = ({ Icon }) => <Icon size={18} className="shrink-0" />;
  const hasPermission = (menu) => userPermissions.includes(menu._id);


  return (
    <aside
      className={
        `z-40 w-64 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-800
         fixed md:static inset-y-0 left-0 transform md:transform-none transition-transform
         ${openMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`
      }
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 font-semibold">
          React Admin
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menus.map((m) => {
           if (!hasPermission(m)) return null;
            const hasSub = Array.isArray(m.submenus) && m.submenus.length > 0;
            const isOpen = !!openMenu[m.name];
            const Icon = Users;
            return (
              <div key={m.name}>
                {hasSub ? (
                  <button
                    onClick={() => toggle(m.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ItemIcon Icon={Icon} />
                    <span className="flex-1 text-left">{m.name}</span>
                    <ChevronRight size={16} className={`transition-transform ${isOpen ? 'rotate-90 text-indigo-400' : 'text-gray-400'}`} />
                  </button>
                ) : (
                  <NavLink
                    to={m.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800
                       ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-indigo-400' : ''}`
                    }
                  >
                    <ItemIcon Icon={Icon} />
                    <span>{m.name}</span>
                  </NavLink>
                )}

                {hasSub && isOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {m.submenus.map((sub) => {
                       if (!hasPermission(sub)) return null;
                      const SubIcon =Users;
                      return (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-sm
                             ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`
                          }
                        >
                          <SubIcon size={16} className="text-indigo-400" />
                          <span>{sub.name}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
          © {new Date().getFullYear()} React Admin
           <DarkModeToggle />
        </div>
      </div>
    </aside>
  );
}
