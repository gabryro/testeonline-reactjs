import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { courseService } from '@/services/course.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Course } from '@/models';

export function CourseViewerPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const courseId = params.get('id');
  const token = params.get('token');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (token) {
          const c = await courseService.getCourseByToken(token);
          setCourse(c);
        } else if (courseId) {
          const c = await courseService.getCourse(courseId);
          setCourse(c);
        }
      } catch {
        navigate('/cursuri');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, token, navigate]);

  const handleComplete = async () => {
    if (course?.id) {
      await courseService.recordCompletion(course.id, '').catch(() => {});
      setCompleted(true);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!course) return null;

  const slide = course.slides[currentSlide];
  const isLast = currentSlide === course.slides.length - 1;

  if (completed) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-trophy display-1 text-warning mb-3 d-block" />
        <h2 className="fw-bold">{t('courseViewer.completed')}</h2>
        <p className="text-muted">{course.title}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          {t('student.goHome')}
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Slide list sidebar */}
      <div className="border-end bg-white d-none d-md-flex flex-column" style={{ width: 260 }}>
        <div className="p-3 border-bottom fw-semibold">{course.title}</div>
        <div className="overflow-auto flex-grow-1">
          {course.slides.map((s, i) => (
            <button
              key={i}
              className={`w-100 text-start p-3 border-bottom ${i === currentSlide ? 'bg-primary text-white' : ''}`}
              style={{ background: i === currentSlide ? undefined : 'transparent', border: 'none' }}
              onClick={() => setCurrentSlide(i)}
            >
              <div className="small fw-semibold">{i + 1}. {s.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-grow-1 p-4">
        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>{currentSlide + 1} / {course.slides.length}</span>
            <span>{Math.round(((currentSlide + 1) / course.slides.length) * 100)}%</span>
          </div>
          <div className="progress" style={{ height: 4 }}>
            <div
              className="progress-bar"
              style={{ width: `${((currentSlide + 1) / course.slides.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="fw-bold mb-4">{slide.title}</h3>

        {slide.type === 'text' && (
          <div className="prose" style={{ whiteSpace: 'pre-wrap' }}>{slide.content}</div>
        )}
        {slide.type === 'video' && slide.mediaUrl && (
          <div className="ratio ratio-16x9">
            <iframe src={slide.mediaUrl} allowFullScreen title={slide.title} />
          </div>
        )}
        {slide.type === 'pdf' && slide.mediaUrl && (
          <embed src={slide.mediaUrl} type="application/pdf" width="100%" height="600px" />
        )}

        <div className="d-flex justify-content-between mt-4">
          <button
            className="btn btn-outline-secondary"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((i) => i - 1)}
          >
            {t('student.prev')}
          </button>
          {isLast ? (
            <button className="btn btn-success" onClick={handleComplete}>
              {t('courseViewer.complete')}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentSlide((i) => i + 1)}>
              {t('student.next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
