import { useEffect, useState } from 'react';

interface LiveBidState {
	currentBid: number;
	highestBidder: string;
	timeRemaining: number;
}

export function useLiveBids(initial: LiveBidState, wsUrlFromProps?: string) {
	const [state, setState] = useState<LiveBidState>(initial);

	useEffect(() => {
		let cleanup: (() => void) | undefined;

		(async () => {
			try {
				const wsUrl = wsUrlFromProps ?? ((import.meta as any).env?.VITE_BIDS_WS_URL as string | undefined);
				if (wsUrl) {
					const { io } = await import('socket.io-client');
					const socket = io(wsUrl, { transports: ['websocket'], autoConnect: true });
					socket.on('bid:update', (payload: Partial<LiveBidState>) => {
						setState(prev => ({
							currentBid: payload.currentBid ?? prev.currentBid,
							highestBidder: payload.highestBidder ?? prev.highestBidder,
							timeRemaining: payload.timeRemaining ?? prev.timeRemaining,
						}));
					});
					cleanup = () => socket.disconnect();
					return;
				}
			} catch (_) {
				// Fall through to simulation
			}

		// Simulation fallback if no WS URL
		const id = setInterval(() => {
			setState(prev => {
				const nextBid = Math.random() < 0.4 ? prev.currentBid + Math.floor(100 + Math.random() * 500) : prev.currentBid;
				const bidders = ['KenyaCorp', 'TechStart', 'DigitalKenya', 'InnovateLab'];
				const nextBidder = nextBid !== prev.currentBid ? bidders[Math.floor(Math.random() * bidders.length)] : prev.highestBidder;
				const nextTime = Math.max(0, prev.timeRemaining - 1);
				return { currentBid: nextBid, highestBidder: nextBidder, timeRemaining: nextTime };
			});
		}, 1000);
		cleanup = () => clearInterval(id);

		return () => cleanup?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps
		})();

		return () => cleanup?.();
	}, []);

	return state;
}


