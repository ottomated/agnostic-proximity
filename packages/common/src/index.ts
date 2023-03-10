import { z } from 'zod';

export const gameStateSchema =  z.object({
  GameState: z.object({
    players: z.array(
      z.object({
				id: z.string(),
				name: z.string(),
        position: z.tuple([z.number(), z.number(), z.number()]),
        rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        volume: z.number(),
      })
    ),
    falloffDistance: z.number().min(0),
  }),
});
export const defaultGameState = {
  players: [],
  falloffDistance: 10,
} satisfies GameState;

export type GameState = z.infer<typeof gameStateSchema>['GameState'];
export type Player = GameState['players'][number];
