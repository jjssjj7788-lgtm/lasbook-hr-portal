import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

export default function StaffEnrollment() {
  const [courses, setCourses] = useState<any[]>([]);
  const { user } = useAuthStore();

  // 현재 로그인한 직원의 직군 배열
  const userTypes: string[] = (user as any)?.types || ((user as any)?.type ? [(user as any).type] : []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    api.get('/courses').then(res => setCourses(res.data)).catch(console.error);
  };

  // 직군 제한 확인: targetJobTypes가 없으면 전체 허용
  const isEligible = (course: any): boolean => {
    if (!course.targetJobTypes) return true;
    try {
      const allowed: string[] = JSON.parse(course.targetJobTypes);
      if (allowed.length === 0) return true;
      return userTypes.some(t => allowed.includes(t));
    } catch {
      return true;
    }
  };

  const getTargetLabel = (course: any): string[] => {
    if (!course.targetJobTypes) return [];
    try { return JSON.parse(course.targetJobTypes); } catch { return []; }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      alert('수강 신청이 완료되었습니다!');
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || '수강 신청에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 rounded-2xl shadow text-white">
        <h1 className="text-2xl font-bold">진행 중인 교육 과정</h1>
        <p className="mt-1 text-indigo-100 text-sm">본인 직군에 해당하는 교육만 신청 가능합니다.</p>
        {userTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {userTypes.map(t => (
              <span key={t} className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map(course => {
          const eligible = isEligible(course);
          const targets = getTargetLabel(course);
          return (
            <div
              key={course.id}
              className={`bg-white p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                eligible
                  ? 'border-gray-100 shadow-sm hover:shadow-md'
                  : 'border-gray-100 shadow-sm opacity-60'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-base font-bold text-gray-900">{course.title}</h3>
                  {!eligible && (
                    <span className="shrink-0 bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-lg font-semibold flex items-center gap-1">
                      🔒 신청 불가
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1.5">
                  연계 프로젝트: {course.project?.name || '미설정'}
                </p>
                {targets.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400">대상:</span>
                    {targets.map(t => (
                      <span
                        key={t}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          userTypes.includes(t)
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {course.maxAttendees && (
                  <p className="text-xs text-gray-400 mt-1">정원: {course.maxAttendees}명</p>
                )}
              </div>

              {eligible ? (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="mt-5 w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition"
                >
                  이 과정 신청하기
                </button>
              ) : (
                <div className="mt-5 w-full py-2.5 bg-gray-50 text-gray-400 text-sm font-medium rounded-xl text-center border border-dashed border-gray-200">
                  해당 직군만 신청 가능
                </div>
              )}
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400">현재 개설된 교육 과정이 없습니다.</div>
        )}
      </div>
    </div>
  );
}
