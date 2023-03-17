import { z } from 'zod';

export const gameStateSchema =  z.object({
  GameState: z.object({
    players: z.array(
      z.object({
				id: z.string(),
				name: z.string(),
        position: z.object({
					x: z.number(),
					y: z.number(),
					z: z.number(),
				}),
        rotation: z.object({
					x: z.number(),
					y: z.number(),
					z: z.number(),
					w: z.number(),
				}),
        volume: z.number(),
      })
    ),
    maxDistance: z.number().min(0),
		refDistance: z.number().min(0),
		rolloffFactor: z.number().min(0),
		coneInnerAngle: z.number().min(0).max(360),
		coneOuterAngle: z.number().min(0).max(360),
		coneOuterGain: z.number().min(0).max(1),
  }),
});
export const defaultGameState = {
  players: [],
  maxDistance: 90,
	refDistance: 20,
	rolloffFactor: 1,
	coneInnerAngle: 360,
	coneOuterAngle: 0,
	coneOuterGain: 0,
} satisfies GameState;

export type GameState = z.infer<typeof gameStateSchema>['GameState'];
export type Player = GameState['players'][number];
