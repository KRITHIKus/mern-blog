import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { cx, Skeleton } from '../ui'
import { getCategoryLabel } from '../../constants/categories'
import { excerpt, formatDate, imageUrl, readingTime } from '../../utils/content'
import { postPath } from '../../utils/posts'

const IMAGE_WIDTH = { lead: 1400, feature: 1100, card: 720, row: 360 }
const EXCERPT_LENGTH = { lead: 240, feature: 180, card: 130, row: 150 }
const HAS_IMAGE = new Set(['lead', 'feature', 'card', 'row'])

/**
 * Article preview. Variants:
 *   lead    — the front-page story: large image with an overlapping text panel
 *   feature — large image-led story
 *   card    — standard visual card
 *   row     — horizontal story with a thumbnail
 *   index   — typographic archive row (date · title · topic · time)
 *   compact — numbered text item
 * The whole card is one link (stretched from the headline).
 */
export default function PostCard({ post, variant = 'card', as: Heading = 'h3', index, priority = false, className, style }) {
  const minutes = readingTime(post.content)
  const summaryLength = EXCERPT_LENGTH[variant]
  const topic = getCategoryLabel(post.category)
  const date = <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>

  if (variant === 'index') {
    return (
      <article className={cx('pc', 'pc--index', className)} style={style}>
        <p className="pc__date">{date}</p>
        <Heading className="pc__title"><Link to={postPath(post)} className="pc__link">{post.title}</Link></Heading>
        <p className="pc__topic">{topic}</p>
        <p className="pc__time">{minutes} min</p>
        <HiArrowRight className="pc__arrow" aria-hidden="true" />
      </article>
    )
  }

  return (
    <article className={cx('pc', `pc--${variant}`, className)} style={style}>
      {HAS_IMAGE.has(variant) && post.image && (
        <div className="pc__media">
          <img
            src={imageUrl(post.image, IMAGE_WIDTH[variant])}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      )}

      <div className="pc__body">
        {index !== undefined && <span className="pc__index" aria-hidden="true">{String(index).padStart(2, '0')}</span>}
        <p className="pc__topic">{topic}</p>
        <Heading className="pc__title">
          <Link to={postPath(post)} className="pc__link">{post.title}</Link>
        </Heading>
        {summaryLength && <p className="pc__excerpt">{excerpt(post.content, summaryLength)}</p>}
        <p className="pc__meta">
          {date}
          <span aria-hidden="true">·</span>
          <span>{minutes} min read</span>
        </p>
        {variant === 'lead' && (
          <span className="pc__cta" aria-hidden="true">Read the story <HiArrowRight /></span>
        )}
      </div>
    </article>
  )
}

export function PostCardSkeleton({ variant = 'card', className }) {
  return (
    <div className={cx('pc', `pc--${variant}`, 'pc--skeleton', className)} aria-hidden="true">
      {HAS_IMAGE.has(variant) && <div className="pc__media"><Skeleton height="100%" /></div>}
      <div className="pc__body">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="90%" height="1.4em" />
        <Skeleton variant="text" width="65%" height="1.4em" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  )
}
