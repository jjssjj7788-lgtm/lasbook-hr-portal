import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function AdminHome() {
  const navigate = useNavigate();
  const { setSelectedProject } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then((r) => {
      setProjects(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectProject = (project: any) => {
    setSelectedProject(project.id);
    navigate('/admin/dashboard');
  };

  const projectConfig: Record<string, { color: string; bg: string; border: string; icon: string; desc: string }> = {
    '수학의 띠': {
      color: 'text-violet-300',
      bg: 'bg-violet-600/10 hover:bg-violet-600/20',
      border: 'border-violet-500/30 hover:border-violet-500/60',
      icon: '🧮',
      desc: '띠 매니저 기반 수학 교육 구독 영업 프로젝트',
    },
    '시니어 라스': {
      color: 'text-amber-300',
      bg: 'bg-amber-600/10 hover:bg-amber-600/20',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      icon: '🌟',
      desc: '테바 → 도제 → 수련생 체계의 시니어 영업 프로젝트',
    },
  };

  return (
    <div className="min-h-full bg-slate-950 flex flex-col items-center justify-center p-8">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/40 mb-5">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">라스북 HR 포털</h1>
        <p className="text-slate-400 text-lg">관리할 프로젝트를 선택해 주세요</p>
      </div>

      {/* 프로젝트 카드 */}
      {loading ? (
        <div className="flex gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="w-72 h-56 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-6 flex-wrap justify-center">
          {projects.map((project) => {
            const cfg = projectConfig[project.name] ?? {
              color: 'text-slate-300',
              bg: 'bg-slate-700/20 hover:bg-slate-700/40',
              border: 'border-slate-600/30 hover:border-slate-500/60',
              icon: '📁',
              desc: project.description ?? '',
            };
            return (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project)}
                className={`w-72 p-7 rounded-2xl border-2 transition-all duration-200 text-left group cursor-pointer ${cfg.bg} ${cfg.border}`}
              >
                {/* 상태 뱃지 */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-4xl">{cfg.icon}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${project.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/30 text-slate-400'}`}>
                    {project.status === 'ACTIVE' ? '● 운영중' : '종료'}
                  </span>
                </div>

                {/* 프로젝트명 */}
                <h2 className={`text-xl font-bold mb-2 group-hover:text-white transition-colors ${cfg.color}`}>
                  {project.name}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                  {cfg.desc}
                </p>

                {/* 진입 버튼 */}
                <div className={`flex items-center gap-2 text-sm font-medium ${cfg.color}`}>
                  <span>관리 시작하기</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 하단 안내 */}
      <p className="mt-10 text-slate-600 text-sm">
        프로젝트를 선택하면 해당 프로젝트의 인사·정산 관리 화면으로 이동합니다
      </p>
    </div>
  );
}
