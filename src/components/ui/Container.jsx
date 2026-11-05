import { cn } from '../../shared/utils/cn'

const Container = ({className, children}) => {
  return (
    <div className={cn('w-full px-gutter lg:px-4 mx-auto max-w-desktop', className)}>
      {children}
    </div>
  )
}

export default Container
