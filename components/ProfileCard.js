"use client"

import { useState } from 'react'

export default function ProfileCard({ user = {}, showActions = true }) {
  const [showActivity, setShowActivity] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  const initials = (user.name || 'U').split(' ').map(n => n[0]).slice(0,2).join('')

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-indigo-50 text-2xl font-bold text-indigo-700">{initials}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
              <div className="mt-1 text-sm text-slate-500">{user.role} • {user.email}</div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                <button className="rounded-md border px-3 py-1 text-sm text-slate-700">Edit</button>
                <button className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600">Deactivate</button>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-700">Contact</h3>
              <div className="mt-2 text-sm text-slate-600">Phone: {user.phone || '—'}</div>
              <div className="mt-1 text-sm text-slate-600">Email: {user.email || '—'}</div>
              <div className="mt-1 text-sm text-slate-600">Location: {user.location || '—'}</div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-700">Account</h3>
              <div className="mt-2 text-sm text-slate-600">Joined: {user.joined || '—'}</div>
              <div className="mt-1 text-sm text-slate-600">Last Login: {user.lastLogin || '—'}</div>
              <div className="mt-1 text-sm text-slate-600">Status: <span className={`ml-2 inline-block rounded px-2 py-0.5 text-xs ${user.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{user.active ? 'Active' : 'Suspended'}</span></div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <button onClick={() => setShowPermissions(s => !s)} className="flex w-full items-center justify-between rounded-md bg-slate-50 px-4 py-2 text-sm text-slate-700">
                <span>Roles & Permissions</span>
                <span className="text-xs text-slate-500">{showPermissions ? 'Hide' : 'Show'}</span>
              </button>

              {showPermissions && (
                <div className="mt-2 rounded-md border bg-white p-3 text-sm text-slate-700">
                  {user.permissions?.length ? (
                    <ul className="list-disc pl-5">
                      {user.permissions.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-400">No special permissions assigned.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <button onClick={() => setShowActivity(s => !s)} className="flex w-full items-center justify-between rounded-md bg-slate-50 px-4 py-2 text-sm text-slate-700">
                <span>Recent Activity</span>
                <span className="text-xs text-slate-500">{showActivity ? 'Hide' : 'Show'}</span>
              </button>

              {showActivity && (
                <div className="mt-2 rounded-md border bg-white p-3 text-sm text-slate-700">
                  {user.activity?.length ? (
                    <ul className="space-y-2">
                      {user.activity.map((a, i) => (
                        <li key={i} className="text-xs text-slate-600">{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-slate-400">No recent activity.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
