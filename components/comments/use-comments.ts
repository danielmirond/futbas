import { useState } from 'react'

type CommentType = 'passio' | 'prediccio' | 'arbitre'

interface Comment {
  id: string
  matchId: string
  displayName: string
  text: string
  type: CommentType
  createdAt: string
  relativeTime: string
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    matchId: '1',
    displayName: 'Joan Puig',
    text: 'Quin golazo de Marc Pujol! Ens portem els tres punts cap a casa!',
    type: 'passio',
    createdAt: '2026-04-06T17:15:00',
    relativeTime: 'fa 3 dies',
  },
  {
    id: '2',
    matchId: '1',
    displayName: 'Marta Vidal',
    text: 'Deia jo que guanyariem 2-1, quina intuicio!',
    type: 'prediccio',
    createdAt: '2026-04-06T17:20:00',
    relativeTime: 'fa 3 dies',
  },
  {
    id: '3',
    matchId: '1',
    displayName: 'Pere Soler',
    text: 'El penal al minut 65 era clarisssim i no l\'ha xiulat. Vergonya d\'arbitratge.',
    type: 'arbitre',
    createdAt: '2026-04-06T17:30:00',
    relativeTime: 'fa 3 dies',
  },
  {
    id: '4',
    matchId: '1',
    displayName: 'Laia Ferrer',
    text: 'Gran ambient avui al camp, la grada plena fins a dalt!',
    type: 'passio',
    createdAt: '2026-04-06T17:45:00',
    relativeTime: 'fa 3 dies',
  },
  {
    id: '5',
    matchId: '1',
    displayName: 'Oriol Mas',
    text: 'Si seguim aixi, ascens directe! Vinga Martinenc!',
    type: 'passio',
    createdAt: '2026-04-06T18:00:00',
    relativeTime: 'fa 3 dies',
  },
]

export function useRealtimeComments(matchId: string) {
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter((c) => c.matchId === matchId)
  )
  const [isLoading] = useState(false)

  function addComment(text: string, type: CommentType) {
    const newComment: Comment = {
      id: String(Date.now()),
      matchId,
      displayName: 'Tu',
      text,
      type,
      createdAt: new Date().toISOString(),
      relativeTime: 'ara',
    }
    setComments((prev) => [...prev, newComment])
  }

  function deleteComment(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return { comments, isLoading, addComment, deleteComment }
}
