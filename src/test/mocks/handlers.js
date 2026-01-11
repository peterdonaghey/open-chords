import { http, HttpResponse } from 'msw';
import { allSongs } from '../fixtures/songs';

const API_BASE = 'https://open-chords.org/api';

export const handlers = [
  // GET /api/songs - List all songs
  http.get(`${API_BASE}/songs`, () => {
    return HttpResponse.json(allSongs);
  }),

  // GET /api/songs/:id - Get specific song
  http.get(`${API_BASE}/songs/:id`, ({ params }) => {
    const { id } = params;
    const song = allSongs.find(s => s.id === id);
    
    if (!song) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(song);
  }),

  // POST /api/songs - Create song
  http.post(`${API_BASE}/songs`, async ({ request }) => {
    const song = await request.json();
    return HttpResponse.json(
      {
        ...song,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // PUT /api/songs/:id - Update song
  http.put(`${API_BASE}/songs/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    
    const { id } = params;
    const song = await request.json();
    
    return HttpResponse.json({
      ...song,
      id,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE /api/songs/:id - Delete song
  http.delete(`${API_BASE}/songs/:id`, ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    
    return HttpResponse.json({ success: true, message: 'Song deleted' });
  }),
];

