import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { courseService } from '@/services/course.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Course, CourseSlide } from '@/models';

const emptySlide = (): CourseSlide => ({ title: '', content: '', type: 'text' });
const emptyCourse = (): Course => ({
  title: '',
  description: '',
  isPublic: false,
  slides: [emptySlide()],
});

export function AddCoursePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const courseId = params.get('id');
  const [course, setCourse] = useState<Course>(emptyCourse());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      courseService.getCourse(courseId)
        .then((c) => { setCourse(c); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [courseId]);

  const updateCourse = (updates: Partial<Course>) => setCourse((c) => ({ ...c, ...updates }));

  const updateSlide = (idx: number, updates: Partial<CourseSlide>) => {
    setCourse((c) => {
      const slides = [...c.slides];
      slides[idx] = { ...slides[idx], ...updates };
      return { ...c, slides };
    });
  };

  const addSlide = () => {
    setCourse((c) => ({ ...c, slides: [...c.slides, emptySlide()] }));
    setActiveSlideIdx(course.slides.length);
  };

  const removeSlide = (idx: number) => {
    if (course.slides.length <= 1) return;
    setCourse((c) => ({ ...c, slides: c.slides.filter((_, i) => i !== idx) }));
    setActiveSlideIdx(Math.max(0, idx - 1));
  };

  const handleSave = async () => {
    if (!course.title.trim()) { toast.error(t('addCourse.titleRequired')); return; }
    setSaving(true);
    try {
      await courseService.saveCourse(course);
      toast.success(t('addCourse.saved'));
      navigate('/user-home');
    } catch {
      toast.error(t('addCourse.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const activeSlide = course.slides[activeSlideIdx];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{courseId ? t('addCourse.editTitle') : t('addCourse.newTitle')}</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving && <span className="spinner-border spinner-border-sm me-2" />}
          {t('common.save')}
        </button>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">{t('addCourse.courseTitle')}</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={course.title}
                    onChange={(e) => updateCourse({ title: e.target.value })}
                    placeholder={t('addCourse.titlePlaceholder')}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="coursePublic"
                      checked={course.isPublic || false}
                      onChange={(e) => updateCourse({ isPublic: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="coursePublic">
                      {t('addCourse.public')}
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">{t('addCourse.description')}</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={course.description || ''}
                    onChange={(e) => updateCourse({ description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slides list */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">
              {t('addCourse.slides')} ({course.slides.length})
            </div>
            <div className="list-group list-group-flush">
              {course.slides.map((s, i) => (
                <button
                  key={i}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${i === activeSlideIdx ? 'active' : ''}`}
                  onClick={() => setActiveSlideIdx(i)}
                >
                  <span className="text-truncate small" style={{ maxWidth: 140 }}>
                    {i + 1}. {s.title || t('addCourse.untitledSlide')}
                  </span>
                  <button
                    className={`btn btn-sm ${i === activeSlideIdx ? 'btn-outline-light' : 'btn-outline-danger'}`}
                    onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </button>
              ))}
            </div>
            <div className="card-footer bg-transparent">
              <button className="btn btn-primary btn-sm w-100" onClick={addSlide}>
                <i className="bi bi-plus me-1" />{t('addCourse.addSlide')}
              </button>
            </div>
          </div>
        </div>

        {/* Slide editor */}
        <div className="col-md-9">
          {activeSlide && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">{t('addCourse.slideTitle')}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={activeSlide.title}
                      onChange={(e) => updateSlide(activeSlideIdx, { title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">{t('addCourse.slideType')}</label>
                    <select
                      className="form-select"
                      value={activeSlide.type}
                      onChange={(e) => updateSlide(activeSlideIdx, { type: e.target.value as CourseSlide['type'] })}
                    >
                      <option value="text">{t('addCourse.textSlide')}</option>
                      <option value="video">{t('addCourse.videoSlide')}</option>
                      <option value="pdf">{t('addCourse.pdfSlide')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label fw-semibold">{t('addCourse.content')}</label>
                  {activeSlide.type === 'text' ? (
                    <textarea
                      className="form-control"
                      rows={10}
                      value={activeSlide.content}
                      onChange={(e) => updateSlide(activeSlideIdx, { content: e.target.value })}
                    />
                  ) : (
                    <input
                      type="url"
                      className="form-control"
                      placeholder={t('addCourse.urlPlaceholder')}
                      value={activeSlide.mediaUrl || ''}
                      onChange={(e) => updateSlide(activeSlideIdx, { mediaUrl: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
