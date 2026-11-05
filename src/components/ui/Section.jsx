import { cn } from '../../shared/utils/cn'
import Container from './Container'

const Section = ({children, className, containerClassName}) => {
  return (
    <section className={cn('', className)}>
      <Container className={containerClassName}>
        {children}
      </Container>
    </section>
  )
}

export default Section
