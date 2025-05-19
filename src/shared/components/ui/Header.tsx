'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { useUser } from '@/context/UserContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const router = useRouter();

  const { user } = useUser();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }
  
  // Log user data to debug profile picture
  console.log('User data in header:', { 
    hasImage: !!user.image, 
    imageUrl: user.image,
    firstName: user.firstName,
    lastName: user.lastName
  });

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-500 hover:to-purple-500 transition-all">
                experlo
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Menu as="div" className="relative ml-3">
              <Menu.Button className="flex items-center max-w-xs bg-white rounded-full hover:ring-2 hover:ring-indigo-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image.startsWith('http') ? user.image : user.image.startsWith('/') ? user.image : `/${user.image}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm"
                      onError={(e) => {
                        console.error('Error loading profile image:', e);
                        // Fallback to icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        // We'll need to show the icon as fallback
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const iconEl = document.createElement('span');
                          iconEl.className = 'h-9 w-9 text-indigo-600 flex items-center justify-center';
                          iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
                          parent.appendChild(iconEl);
                        }
                      }}
                    />
                  ) : (
                    <UserCircleIcon className="h-9 w-9 text-indigo-600 cursor-pointer" />
                  )}
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden border border-gray-100">
                  <div className="py-2 px-1">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/profile"
                          className={`${active ? 'bg-gray-50' : ''} block px-3 py-2 text-sm text-gray-700 rounded-md mx-1 transition-colors duration-150 hover:bg-gray-50`}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    {!user.isExpert && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/become-expert"
                            className={`${active ? 'bg-gray-50' : ''} block px-3 py-2 text-sm text-gray-700 rounded-md mx-1 transition-colors duration-150 hover:bg-gray-50`}
                          >
                            Become an Expert
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/bookings"
                          className={`${active ? 'bg-gray-50' : ''} block px-3 py-2 text-sm text-gray-700 rounded-md mx-1 transition-colors duration-150 hover:bg-gray-50`}
                        >
                          My Bookings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/settings"
                          className={`${active ? 'bg-gray-50' : ''} block px-3 py-2 text-sm text-gray-700 rounded-md mx-1 transition-colors duration-150 hover:bg-gray-50`}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer`}
                        >
                          Sign Out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}
