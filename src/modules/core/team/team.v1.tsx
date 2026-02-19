/**
 * Team Module v1
 * Team members grid
 */

import { z } from 'zod';

import { backgroundConfigSchema, type ModuleDefinition } from '../../types';

// =====================================================
// Config Schema
// =====================================================

const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  social: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
});

export const teamV1ConfigSchema = z.object({
  /** Section title */
  title: z.string().optional(),
  /** Section subtitle */
  subtitle: z.string().optional(),
  /** Team members */
  members: z.array(teamMemberSchema).default([]),
  /** Layout columns */
  columns: z.enum(['2', '3', '4']).default('4'),
  /** Card style */
  cardStyle: z.enum(['simple', 'detailed', 'minimal']).default('simple'),
  /** Show social links */
  showSocial: z.boolean().default(true),
  /** Background */
  background: backgroundConfigSchema.default({ type: 'none' }),
});

export type TeamV1Config = z.infer<typeof teamV1ConfigSchema>;

// =====================================================
// Default Config
// =====================================================

export const teamV1DefaultConfig: TeamV1Config = {
  title: 'Ekibimiz',
  subtitle: 'Deneyimli ve tutkulu ekip arkadaşlarımız',
  members: [
    {
      name: 'Ahmet Yıldız',
      role: 'Kurucu & CEO',
      bio: '15 yıllık sektör deneyimi',
      social: { linkedin: '#', instagram: '#' },
    },
    {
      name: 'Fatma Kara',
      role: 'Baş Tasarımcı',
      bio: 'Çiçek düzenleme uzmanı',
      social: { instagram: '#' },
    },
    {
      name: 'Emre Demir',
      role: 'Operasyon Müdürü',
      bio: 'Lojistik ve teslimat yönetimi',
      social: { linkedin: '#' },
    },
    {
      name: 'Selin Aydın',
      role: 'Müşteri İlişkileri',
      bio: 'Mutlu müşteriler için burada',
      social: { instagram: '#', twitter: '#' },
    },
  ],
  columns: '4',
  cardStyle: 'simple',
  showSocial: true,
  background: { type: 'none' as const },
};

// =====================================================
// Module Metadata
// =====================================================

export const teamV1Meta = {
  id: 'team.v1',
  name: 'Ekip Üyeleri',
  description: 'Takım üyelerini tanıtan grid',
  category: 'content' as const,
  icon: 'Users',
  version: '1.0.0',
  tags: ['team', 'members', 'about', 'people'],
};

// =====================================================
// Render Component
// =====================================================

function TeamV1Render({
  block,
}: {
  block: { config: TeamV1Config };
  isPreview?: boolean;
}) {
  const { config } = block;

  const gridCols: Record<string, string> = {
    '2': 'md:grid-cols-2',
    '3': 'md:grid-cols-3',
    '4': 'sm:grid-cols-2 lg:grid-cols-4',
  };

  const { getBackgroundStyle, needsOverlay } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  const bgStyle = getBackgroundStyle(config.background as import('../../shared/background-picker').BackgroundConfig);
  const showOverlay = needsOverlay(config.background as import('../../shared/background-picker').BackgroundConfig);

  return (
    <section className="relative py-16 px-4 md:px-8" style={bgStyle}>
      {showOverlay && (
        <div className="absolute inset-0 bg-black/50" style={{ opacity: ((config.background as Record<string, unknown>)?.overlayOpacity as number ?? 40) / 100 }} />
      )}
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="mb-12 text-center">
            {config.title && (
              <h2 className="text-3xl font-bold md:text-4xl">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{config.subtitle}</p>
            )}
          </div>
        )}

        {/* Team Grid */}
        <div className={`grid gap-8 ${gridCols[config.columns]}`}>
          {config.members.map((member, index) => (
            <div
              key={index}
              className={`text-center ${
                config.cardStyle === 'detailed' ? 'rounded-xl border bg-card p-6' : ''
              }`}
            >
              {/* Avatar */}
              <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <h3 className="text-lg font-semibold">{member.name}</h3>
              {member.role && (
                <p className="text-sm text-primary">{member.role}</p>
              )}

              {/* Bio */}
              {config.cardStyle === 'detailed' && member.bio && (
                <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
              )}

              {/* Social Links */}
              {config.showSocial && member.social && (
                <div className="mt-3 flex justify-center gap-3">
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      className="text-muted-foreground hover:text-primary"
                    >
                      𝕏
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      className="text-muted-foreground hover:text-primary"
                    >
                      in
                    </a>
                  )}
                  {member.social.instagram && (
                    <a
                      href={member.social.instagram}
                      className="text-muted-foreground hover:text-primary"
                    >
                      📷
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// Editor Component
// =====================================================

function TeamV1Editor({
  config,
  onChange,
}: {
  config: TeamV1Config;
  onChange: (config: TeamV1Config) => void;
}) {
  const addMember = () => {
    onChange({
      ...config,
      members: [
        ...config.members,
        { name: 'Yeni Üye', role: 'Pozisyon' },
      ],
    });
  };

  const removeMember = (index: number) => {
    onChange({
      ...config,
      members: config.members.filter((_, i) => i !== index),
    });
  };

  const updateMember = (
    index: number,
    field: string,
    value: string
  ) => {
    const newMembers = [...config.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    onChange({ ...config, members: newMembers });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Başlık</label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Alt Başlık</label>
        <input
          type="text"
          value={config.subtitle || ''}
          onChange={(e) => onChange({ ...config, subtitle: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sütun</label>
          <select
            value={config.columns}
            onChange={(e) =>
              onChange({ ...config, columns: e.target.value as '2' | '3' | '4' })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="2">2 Sütun</option>
            <option value="3">3 Sütun</option>
            <option value="4">4 Sütun</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kart Stili</label>
          <select
            value={config.cardStyle}
            onChange={(e) =>
              onChange({
                ...config,
                cardStyle: e.target.value as 'simple' | 'detailed' | 'minimal',
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="simple">Basit</option>
            <option value="detailed">Detaylı</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={config.showSocial}
          onChange={(e) => onChange({ ...config, showSocial: e.target.checked })}
        />
        <span className="text-sm">Sosyal Medya Linklerini Göster</span>
      </label>

      {/* Background */}
      <TeamBackgroundPicker
        value={config.background as import('../../shared/background-picker').BackgroundConfig}
        onChange={(bg: import('../../shared/background-picker').BackgroundConfig) => onChange({ ...config, background: bg })}
      />

      {/* Members List */}
      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Ekip Üyeleri ({config.members.length})</label>
          <button
            type="button"
            onClick={addMember}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Üye Ekle
          </button>
        </div>
        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {config.members.map((member, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{member.name || `Üye ${index + 1}`}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { const ni = index - 1; if (ni < 0) return; const m = [...config.members]; [m[index], m[ni]] = [m[ni], m[index]]; onChange({ ...config, members: m }); }} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Yukarı">↑</button>
                  <button type="button" onClick={() => { const ni = index + 1; if (ni >= config.members.length) return; const m = [...config.members]; [m[index], m[ni]] = [m[ni], m[index]]; onChange({ ...config, members: m }); }} disabled={index === config.members.length - 1} className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30" title="Aşağı">↓</button>
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    aria-label="Üyeyi sil"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-2">
                <label className="mb-1 block text-xs text-muted-foreground">Fotoğraf</label>
                <TeamMemberPhotoUpload
                  value={member.image || ''}
                  onChange={(url) => updateMember(index, 'image', url)}
                />
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="İsim"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                <input
                  type="text"
                  placeholder="Pozisyon"
                  value={member.role || ''}
                  onChange={(e) => updateMember(index, 'role', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                <textarea
                  placeholder="Kısa biyografi"
                  value={member.bio || ''}
                  onChange={(e) => updateMember(index, 'bio', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  rows={2}
                />
                {config.showSocial && (
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Instagram"
                      value={member.social?.instagram || ''}
                      onChange={(e) => {
                        const newMembers = [...config.members];
                        newMembers[index] = {
                          ...newMembers[index],
                          social: { ...newMembers[index].social, instagram: e.target.value },
                        };
                        onChange({ ...config, members: newMembers });
                      }}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Twitter"
                      value={member.social?.twitter || ''}
                      onChange={(e) => {
                        const newMembers = [...config.members];
                        newMembers[index] = {
                          ...newMembers[index],
                          social: { ...newMembers[index].social, twitter: e.target.value },
                        };
                        onChange({ ...config, members: newMembers });
                      }}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="LinkedIn"
                      value={member.social?.linkedin || ''}
                      onChange={(e) => {
                        const newMembers = [...config.members];
                        newMembers[index] = {
                          ...newMembers[index],
                          social: { ...newMembers[index].social, linkedin: e.target.value },
                        };
                        onChange({ ...config, members: newMembers });
                      }}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Background picker wrapper */
function TeamBackgroundPicker(props: { value: import('../../shared/background-picker').BackgroundConfig; onChange: (bg: import('../../shared/background-picker').BackgroundConfig) => void }) {
  const { BackgroundPicker } = require('../../shared/background-picker') as typeof import('../../shared/background-picker');
  return <BackgroundPicker value={props.value} onChange={props.onChange} imageFolder="team" />;
}

/** Photo upload wrapper using shared ImageUploadField */
function TeamMemberPhotoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { ImageUploadField } = require('../../shared/image-upload-field') as { ImageUploadField: typeof import('../../shared/image-upload-field').ImageUploadField };
  return (
    <ImageUploadField
      value={value || undefined}
      onChange={onChange}
      folder="team"
      compact={true}
      showUrlInput={true}
      previewClass="h-16 w-16 rounded-full object-cover"
    />
  );
}

// =====================================================
// Module Definition
// =====================================================

export const teamV1Module: ModuleDefinition<TeamV1Config> = {
  meta: teamV1Meta,
  configSchema: teamV1ConfigSchema,
  defaultConfig: teamV1DefaultConfig,
  Render: TeamV1Render,
  Editor: TeamV1Editor,
};
