import { Directive, ElementRef, Input, DoCheck, Renderer2 } from '@angular/core';

@Directive({
	selector: '[appHighlightChange]',
	standalone: true,
})
export class AppHighlightChangeDirective implements DoCheck {
	@Input() value?: number;
	private prev?: number;

	constructor(private el: ElementRef<HTMLElement>, private r: Renderer2) {}

	ngDoCheck(): void {
		if (this.prev == null) {
			this.prev = this.value;
			return;
		}
		if (this.value == null) return;
		if (this.value > this.prev) {
			this.flash('up');
		} else if (this.value < this.prev) {
			this.flash('down');
		}
		this.prev = this.value;
	}

	private flash(kind: 'up' | 'down') {
		const cls = kind === 'up' ? 'flash-up' : 'flash-down';
		this.r.addClass(this.el.nativeElement, cls);
		setTimeout(() => this.r.removeClass(this.el.nativeElement, cls), 300);
	}
}
