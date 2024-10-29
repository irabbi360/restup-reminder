// toast.js
class Toast {
    constructor(options = {}) {
        this.options = {
            position: options.position || 'top-right',
            duration: options.duration || 3000,
            containerClass: options.containerClass || 'toast-container',
            animationDuration: 300, // in milliseconds
        }
        this.init()
    }

    init() {
        if (!document.querySelector(`.${this.options.containerClass}`)) {
            const container = document.createElement('div')
            container.className = this.options.containerClass
            document.body.appendChild(container)

            // Add styles
            const style = document.createElement('style')
            style.textContent = `
        .toast-container {
          position: fixed;
          z-index: 9999;
          padding: 15px;
          pointer-events: none;
        }
        .toast-container.top-right {
          top: 0;
          right: 0;
        }
        .toast-container.top-left {
          top: 0;
          left: 0;
        }
        .toast-container.bottom-right {
          bottom: 0;
          right: 0;
        }
        .toast-container.bottom-left {
          bottom: 0;
          left: 0;
        }
        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          margin: 5px 0;
          min-width: 250px;
          max-width: 400px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          pointer-events: auto;
          transform: translateX(120%);
          transition: transform ${this.options.animationDuration}ms ease-in-out;
        }
        .toast.show {
          transform: translateX(0);
        }
        .toast.hide {
          transform: translateX(120%);
        }
        .toast.success {
          border-left: 4px solid #4caf50;
        }
        .toast.error {
          border-left: 4px solid #f44336;
        }
        .toast.warning {
          border-left: 4px solid #ff9800;
        }
        .toast.info {
          border-left: 4px solid #2196f3;
        }
        .toast-icon {
          font-size: 20px;
        }
        .toast-content {
          flex-grow: 1;
        }
        .toast-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .toast-message {
          color: #666;
        }
        .toast-close {
          cursor: pointer;
          padding: 4px;
          background: none;
          border: none;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .toast-close:hover {
          opacity: 1;
        }
      `
            document.head.appendChild(style)
        }
    }

    show(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = this.options.duration
        } = options

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        }

        const container = document.querySelector(`.${this.options.containerClass}`)
        const toast = document.createElement('div')
        toast.className = `toast ${type}`
        toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">✕</button>
    `

        container.appendChild(toast)

        // Trigger reflow to ensure the animation works
        toast.offsetHeight

        // Show toast
        setTimeout(() => {
            toast.classList.add('show')
        }, 10)

        // Setup close button
        const closeButton = toast.querySelector('.toast-close')
        closeButton.addEventListener('click', () => {
            this.dismiss(toast)
        })

        // Auto dismiss
        if (duration !== 0) {
            setTimeout(() => {
                this.dismiss(toast)
            }, duration)
        }
    }

    dismiss(toast) {
        toast.classList.add('hide')
        setTimeout(() => {
            toast.remove()
        }, this.options.animationDuration)
    }
}
