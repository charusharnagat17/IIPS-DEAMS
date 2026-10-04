export class AntiCheatingEngine {
  constructor({ maxStrikes = 3, onInfraction, onDisqualification }) {
    this.maxStrikes = maxStrikes;
    this.onInfraction = onInfraction || (() => {});
    this.onDisqualification = onDisqualification || (() => {});
    this.infractions = 0;
    this.active = false;

    // Bound listeners for clean detach
    this.handleVisibility = this.handleVisibility.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFullscreen = this.handleFullscreen.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  attach() {
    if (this.active) return;
    this.active = true;

    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('fullscreenchange', this.handleFullscreen);
    document.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('keydown', this.handleKeydown);
  }

  detach() {
    if (!this.active) return;
    this.active = false;

    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('fullscreenchange', this.handleFullscreen);
    document.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('keydown', this.handleKeydown);
  }

  recordViolation(type, details) {
    if (!this.active) return;
    this.infractions += 1;

    const isDisqualified = this.infractions >= this.maxStrikes;
    this.onInfraction({
      type,
      details,
      count: this.infractions,
      max: this.maxStrikes,
      isDisqualified
    });

    if (isDisqualified) {
      this.detach();
      this.onDisqualification({
        type,
        details,
        totalCount: this.infractions
      });
    }
  }

  handleVisibility() {
    if (document.hidden) {
      this.recordViolation('TAB_SWITCH', 'Switched browser tab or minimized window');
    }
  }

  handleBlur() {
    this.recordViolation('WINDOW_BLUR', 'Focus lost from exam environment');
  }

  handleFullscreen() {
    if (!document.fullscreenElement) {
      this.recordViolation('FULLSCREEN_EXIT', 'Exited mandatory full-screen mode');
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
  }

  handleKeydown(e) {
    // Block shortcuts (Ctrl+C, Ctrl+V, etc.)
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 'p', 's'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      this.recordViolation('COPY_ATTEMPT', `Blocked shortcut key: Ctrl+${e.key.toUpperCase()}`);
    }
  }
}
