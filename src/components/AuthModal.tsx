import { useState } from 'react'
import { IconClose, IconInfo } from './icons'

interface AuthModalProps {
  onClose: () => void
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        {submitted ? (
          <div>
            <div className="muted" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
              <IconInfo size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                This is a front-end demo. Accounts, subscriptions, and server-side rendering are not connected.
              </span>
            </div>
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            <input className="field" type="email" placeholder="Email" required />
            <input className="field" type="password" placeholder="Password" required minLength={6} />
            <button className="btn-cta" type="submit" style={{ width: '100%', justifyContent: 'center' }}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 14 }}>
              {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
              <span
                className="text-link"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
