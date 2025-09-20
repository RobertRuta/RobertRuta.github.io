import { normalised } from '@/generated/normalised_data'

// Derive precise item type from the generated data to avoid union mismatches
export type RawItem = typeof normalised.items[number]

export type YearMonth = {
  year: number
  month: number | null // null when month is unknown
}

export type ParsedDate = {
  sortValue: number // milliseconds since epoch for sorting; 0 when unknown
  isoLabel: string // 'YYYY' or 'YYYY-MM' or '' when unknown
  yearMonth: YearMonth | null
}

export function parsePartialDate(input: string | null): ParsedDate {
  if (!input) return { sortValue: 0, isoLabel: '', yearMonth: null }
  if (/^\d{4}-\d{2}$/.test(input)) {
    const [y, m] = input.split('-').map((v) => parseInt(v, 10))
    const t = new Date(y, m - 1, 1).getTime()
    return {
      sortValue: t,
      isoLabel: `${y}-${String(m).padStart(2, '0')}`,
      yearMonth: { year: y, month: m },
    }
  }
  if (/^\d{4}$/.test(input)) {
    const y = parseInt(input, 10)
    const t = new Date(y, 0, 1).getTime()
    return { sortValue: t, isoLabel: `${y}`, yearMonth: { year: y, month: null } }
  }
  const t = Date.parse(input)
  return { sortValue: isNaN(t) ? 0 : t, isoLabel: input, yearMonth: null }
}

export class NormalisedItem {
  constructor(private readonly raw: RawItem) {}

  get id(): string { return this.raw.id }
  get label(): string { return this.raw.label }
  get type(): string | null { return this.raw.type }
  get institution(): string | null { return this.raw.institution }
  get description(): string | null { return this.raw.description }
  get note(): string | null { return this.raw.note }
  get link(): string | null { return this.raw.link }
  get skills(): string[] { return [...(this.raw.skills || [])] }
  get start(): ParsedDate { return parsePartialDate(this.raw.startDate) }
  get end(): ParsedDate { return parsePartialDate(this.raw.endDate) }

  get isOngoing(): boolean { return !this.raw.endDate }
  get displayDate(): string { return this.start.isoLabel }

  hasSkill(skill: string): boolean { return this.skills.includes(skill) }

  labelWithInstitution(): string {
    return this.institution ? `${this.label} — ${this.institution}` : this.label
  }

  toJSON(): RawItem { return this.raw }
}

export class Query {
  private readonly items: NormalisedItem[]
  constructor(items: NormalisedItem[]) { this.items = items }

  where(predicate: (item: NormalisedItem) => boolean): Query {
    return new Query(this.items.filter(predicate))
  }

  ofTypes(types: Iterable<string>): Query {
    const set = new Set(types)
    return this.where((it) => (it.type ? set.has(it.type) : false))
  }

  betweenStart(startInclusive?: string | null, endInclusive?: string | null): Query {
    const startCut = parsePartialDate(startInclusive || null).sortValue
    const endCut = parsePartialDate(endInclusive || null).sortValue || Number.MAX_SAFE_INTEGER
    return this.where((it) => it.start.sortValue >= startCut && it.start.sortValue <= endCut)
  }

  sortByStart(desc: boolean = true): Query {
    const next = [...this.items].sort((a, b) => (desc ? b.start.sortValue - a.start.sortValue : a.start.sortValue - b.start.sortValue))
    return new Query(next)
  }

  sortByEnd(desc: boolean = true): Query {
    const next = [...this.items].sort((a, b) => (desc ? (b.end.sortValue - a.end.sortValue) : (a.end.sortValue - b.end.sortValue)))
    return new Query(next)
  }

  limit(n: number): Query { return new Query(this.items.slice(0, n)) }

  groupByYear(): Map<number, NormalisedItem[]> {
    const map = new Map<number, NormalisedItem[]>()
    for (const it of this.items) {
      const y = it.start.yearMonth?.year
      if (!y) continue
      const arr = map.get(y) || []
      arr.push(it)
      map.set(y, arr)
    }
    return map
  }

  toArray(): NormalisedItem[] { return this.items }
}

export class NormalisedDB {
  private readonly indexById: Map<string, NormalisedItem>
  private readonly allItems: NormalisedItem[]

  constructor() {
    this.allItems = normalised.items.map((r) => new NormalisedItem(r))
    this.indexById = new Map(this.allItems.map((i) => [i.id, i]))
  }

  items(): Query { return new Query(this.allItems) }
  all(): NormalisedItem[] { return this.allItems }
  findById(id: string): NormalisedItem | undefined { return this.indexById.get(id) }
  skills(): string[] { return [...normalised.skills] }
}

export const db = new NormalisedDB()


