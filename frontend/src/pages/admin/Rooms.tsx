import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';

const POSITION_COLORS: Record<string, string> = {
  TEBA: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  DOJE: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  TRAINEE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  MANAGER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export default function AdminRooms() {
  const { selectedProjectId } = useAuthStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [expandedRoom, setExpandedRoom] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState<number | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  const load = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [roomsRes, usersRes] = await Promise.all([
        api.get(`/rooms?projectId=${selectedProjectId}`),
        api.get(`/users?projectId=${selectedProjectId}`),
      ]);
      setRooms(roomsRes.data);
      setUsers(usersRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (selectedProjectId) load(); }, [selectedProjectId]);

  const unassignedUsers = users.filter((u) => !u.roomId && u.role !== 'ADMIN');

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    await api.post('/rooms', { projectId: selectedProjectId, name: newRoomName.trim() });
    setNewRoomName('');
    setShowCreateModal(false);
    load();
  };

  const handleRenameRoom = async (roomId: number) => {
    if (!editingRoomName.trim()) return;
    await api.put(`/rooms/${roomId}`, { name: editingRoomName.trim() });
    setEditingRoomId(null);
    load();
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('팀을 삭제하면 소속 직원들의 팀 배정이 해제됩니다. 계속할까요?')) return;
    await api.delete(`/rooms/${roomId}`);
    load();
  };

  const handleAddMember = async (roomId: number, employeeId: string) => {
    await api.patch(`/rooms/${roomId}/members/${employeeId}`);
    setShowAddMember(null);
    load();
  };

  const handleRemoveMember = async (roomId: number, employeeId: string) => {
    await api.delete(`/rooms/${roomId}/members/${employeeId}`);
    load();
  };

  const handleSetManager = async (roomId: number, managerId: string) => {
    await api.put(`/rooms/${roomId}`, { managerId });
    load();
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-800 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">팀(Room) 관리</h1>
          <p className="text-slate-400 text-sm mt-1">카카오 단톡방 기반 팀을 자유롭게 생성하고 관리합니다</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all">
          + 새 팀 만들기
        </button>
      </div>

      {/* 팀 미배정 알림 */}
      {unassignedUsers.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400">⚠️</span>
            <span className="text-amber-300 text-sm font-medium">팀 미배정 직원 {unassignedUsers.length}명</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unassignedUsers.map((u) => (
              <span key={u.employeeId} className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">
                {u.name} ({u.position?.name ?? '-'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 팀 목록 */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <span className="text-5xl mb-4">💬</span>
          <p className="text-lg font-medium mb-1">생성된 팀이 없습니다</p>
          <p className="text-sm">"새 팀 만들기" 버튼으로 팀을 추가해 주세요</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rooms.map((room) => {
            const isExpanded = expandedRoom === room.id;
            const manager = room.members.find((m: any) => m.employeeId === room.managerId);
            const isEditing = editingRoomId === room.id;
            return (
              <div key={room.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span>💬</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* 팀 이름 인라인 편집 */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingRoomName}
                          onChange={(e) => setEditingRoomName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRenameRoom(room.id); if (e.key === 'Escape') setEditingRoomId(null); }}
                          className="flex-1 px-3 py-1.5 bg-slate-800 border border-indigo-500 rounded-lg text-white text-sm focus:outline-none"
                        />
                        <button onClick={() => handleRenameRoom(room.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">저장</button>
                        <button onClick={() => setEditingRoomId(null)} className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg text-xs">취소</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setExpandedRoom(isExpanded ? null : room.id)}>
                        <h3 className="text-white font-bold text-base">{room.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">{room.members.length}명</span>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 mt-0.5">
                      보고서 담당: {manager ? <span className="text-emerald-400">{manager.name}</span> : <span className="text-slate-600">미지정</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => { setEditingRoomId(room.id); setEditingRoomName(room.name); }}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">이름 변경</button>
                    <button onClick={(e) => { e.stopPropagation(); setShowAddMember(room.id); }}
                      className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">+ 멤버</button>
                    <button onClick={() => handleDeleteRoom(room.id)}
                      className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">삭제</button>
                    <button onClick={() => setExpandedRoom(isExpanded ? null : room.id)} className="text-slate-600 text-sm w-6">{isExpanded ? '▲' : '▼'}</button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 divide-y divide-white/5">
                    {room.members.length === 0 ? (
                      <div className="px-5 py-4 text-center text-slate-600 text-sm">멤버가 없습니다</div>
                    ) : (
                      room.members.map((member: any) => (
                        <div key={member.employeeId} className="flex items-center gap-4 px-5 py-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-300 font-bold text-xs">{member.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white text-sm font-medium">{member.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${POSITION_COLORS[member.position?.code] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                {member.position?.name ?? '-'}
                              </span>
                              {member.employeeId === room.managerId && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">📋 보고서 담당</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{member.employeeId}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {member.employeeId !== room.managerId && (
                              <button onClick={() => handleSetManager(room.id, member.employeeId)}
                                className="text-xs px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors">담당자 지정</button>
                            )}
                            <button onClick={() => handleRemoveMember(room.id, member.employeeId)}
                              className="text-xs px-2.5 py-1 bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors">제거</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 팀 생성 모달 - 자유 이름 입력 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">새 팀 만들기</h3>
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-2">팀 이름 (자유 입력)</label>
              <input
                autoFocus
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="예: DDI Room#1, 강남팀, Senior A조 등"
                className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowCreateModal(false); setNewRoomName(''); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm">취소</button>
              <button onClick={handleCreateRoom} disabled={!newRoomName.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all text-sm font-semibold">만들기</button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 추가 모달 */}
      {showAddMember !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-white mb-4">멤버 추가</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {unassignedUsers.length === 0 ? (
                <p className="text-center text-slate-600 py-6">배정 가능한 직원이 없습니다</p>
              ) : (
                unassignedUsers.map((u) => (
                  <button key={u.employeeId} onClick={() => handleAddMember(showAddMember, u.employeeId)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-left">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center">
                      <span className="text-indigo-300 text-xs font-bold">{u.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{u.name}</div>
                      <div className="text-slate-500 text-xs">{u.position?.name} · {u.employeeId}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowAddMember(null)}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
