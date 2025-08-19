import React from 'react';
import { Card } from '@/components/ui/card';
import { QrCode, Crown, Zap } from 'lucide-react';
import { sponsorSlots } from '@/data/sponsorData';
import { cn } from '@/lib/utils';

interface BaseGridLayerProps {
}

// Static base grid layer: frames, labels (S01–S24), subtle QR icon, pricing chips.
// No animations; always visible behind animated layers.
export const BaseGridLayer: React.FC<BaseGridLayerProps> = () => {
    // Build grid the same way as the main wall so positions line up
    const buildGrid = () => {
        const grid: Array<any> = Array(24).fill(null);
        
        // Place main sponsor first (takes up 2x2)
        const mainSponsor = sponsorSlots.find(s => s.tier === 'main');
        if (mainSponsor) {
            grid[0] = { sponsor: mainSponsor, isMainSponsor: true, isLiveBidding: false };
        }
        
        // Place other slots
        for (let n = 1; n <= 24; n++) {
            const s = sponsorSlots.find(sp => sp.slotNumber === n && sp.tier !== 'main');
            if (s) grid[n - 1] = { sponsor: s, isMainSponsor: false, isLiveBidding: Boolean(s.liveBidding?.enabled) };
        }
        
        // Place live bidding slot in a prominent position
        const live = sponsorSlots.find(s => s.liveBidding?.enabled);
        if (live) grid[12] = { sponsor: live, isMainSponsor: false, isLiveBidding: true };

        return grid;
    };

	const gridLayout = buildGrid();

	return (
		<div className="pointer-events-none">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
				{gridLayout.map((item, index) => {
					if (!item || item === 'occupied') return <div key={index} />;
					const { sponsor, isMainSponsor, isLiveBidding } = item;
					return (
						<div key={`base-${sponsor.id}`} className={isMainSponsor ? 'col-span-2 row-span-2' : ''}>
							<Card className={cn(
								'relative h-full min-h-[120px] border-2 bg-gradient-sponsor-slot backdrop-blur-sm',
								isMainSponsor && 'border-hologram-primary',
								isLiveBidding && 'border-live-bidding',
								!isMainSponsor && !isLiveBidding && 'border-slot-border'
							)}>
								<div className="relative z-10 p-3 h-full flex flex-col justify-between">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-2">
											<span className={cn('text-xs font-mono font-bold px-2 py-1 rounded', isMainSponsor ? 'bg-hologram-primary text-background' : 'bg-muted text-muted-foreground')}>
												S{sponsor.slotNumber.toString().padStart(2, '0')}
											</span>
											{isMainSponsor && <Crown className="w-4 h-4 text-hologram-primary" />}
											{isLiveBidding && <Zap className="w-4 h-4 text-live-bidding" />}
										</div>
										{Boolean(sponsor.qrCode) && (
											<QrCode className="w-4 h-4 text-muted-foreground" />
										)}
									</div>
									<div className="flex-1 flex items-center justify-center opacity-60">
										{Boolean(sponsor.logo) ? (
											<img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-10 object-contain" />
										) : (
											<span className="text-xs text-muted-foreground">{sponsor.name}</span>
										)}
									</div>
									<div className="flex items-center justify-between text-[10px] text-muted-foreground">
										<span>Day €{sponsor.dayPrice.toLocaleString()}</span>
										<span>Wk {typeof sponsor.weekPrice === 'number' ? sponsor.weekPrice : String(sponsor.weekPrice)}k</span>
									</div>
								</div>
							</Card>
						</div>
					);
				})}
			</div>
		</div>
	);
};


