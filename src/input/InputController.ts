export type InputAction = 'left' | 'right' | 'sprint' | 'interact' | 'escape';

type ExternalInputEvent = CustomEvent<{
  action: InputAction;
  state: 'down' | 'up' | 'press';
}>;

export class InputController {
  private held = new Set<InputAction>();
  private pressed = new Set<InputAction>();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.clear);
    window.addEventListener('gallery-input', this.onExternalInput as EventListener);
    window.addEventListener('contextmenu', this.preventContextMenu);
  }

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  takePressed(action: InputAction): boolean {
    if (!this.pressed.has(action)) return false;
    this.pressed.delete(action);
    return true;
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.clear);
    window.removeEventListener('gallery-input', this.onExternalInput as EventListener);
    window.removeEventListener('contextmenu', this.preventContextMenu);
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const action = this.keyToAction(event.code);
    if (!action) return;
    event.preventDefault();

    if (!this.held.has(action)) {
      this.pressed.add(action);
    }

    this.held.add(action);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    const action = this.keyToAction(event.code);
    if (!action) return;
    this.held.delete(action);
  };

  private readonly onExternalInput = (event: ExternalInputEvent) => {
    const { action, state } = event.detail;

    if (state === 'down') {
      if (!this.held.has(action)) this.pressed.add(action);
      this.held.add(action);
    } else if (state === 'up') {
      this.held.delete(action);
    } else {
      this.pressed.add(action);
    }
  };

  private readonly preventContextMenu = (event: MouseEvent) => event.preventDefault();

  private readonly clear = () => {
    this.held.clear();
    this.pressed.clear();
  };

  private keyToAction(code: string): InputAction | undefined {
    switch (code) {
      case 'KeyA':
      case 'ArrowLeft':
        return 'left';
      case 'KeyD':
      case 'ArrowRight':
        return 'right';
      case 'ShiftLeft':
      case 'ShiftRight':
        return 'sprint';
      case 'KeyF':
      case 'KeyE':
        return 'interact';
      case 'Escape':
        return 'escape';
      default:
        return undefined;
    }
  }
}

export function sendInput(action: InputAction, state: 'down' | 'up' | 'press') {
  window.dispatchEvent(
    new CustomEvent('gallery-input', {
      detail: { action, state }
    })
  );
}
