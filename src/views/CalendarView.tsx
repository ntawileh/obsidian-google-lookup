import { ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';
import { CalendarViewRoot } from './components/CalendarViewRoot';
import { AppContext } from '@/utils/context';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class CalendarView extends ItemView {
	#reactRoot: Root | undefined;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return 'Example view';
	}

	async onOpen() {
		this.#reactRoot = createRoot(this.containerEl.children[1]);
		this.#reactRoot.render(
			<AppContext.Provider value={this.app}>
				<CalendarViewRoot />
			</AppContext.Provider>
		);
	}

	async onClose() {
		if (this.#reactRoot) {
			this.#reactRoot.unmount();
		}
	}
}
