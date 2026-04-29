import { BusinessRuleViolationException } from '@shared/domain/exceptions/domain.exceptions';

export interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  private constructor(private props: CategoryProps) {}

  static create(props: CategoryProps): Category {
    if (!props.name || props.name.trim().length < 2) {
      throw new BusinessRuleViolationException('Category name must be at least 2 characters');
    }
    if (!props.slug || !/^[a-z0-9-]+$/.test(props.slug)) {
      throw new BusinessRuleViolationException('Slug must be lowercase alphanumeric with hyphens');
    }
    return new Category({ ...props });
  }

  static reconstitute(props: CategoryProps): Category {
    return new Category(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get description(): string | null { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
