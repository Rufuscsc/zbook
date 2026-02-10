import EditBookForm from '@/components/EditBookForm'

const EditBook = async ({ params }: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await params;
  return (
    <div className="py-5 bg-background min-h-screen">
      <h1 className="text-5xl! md:text-3xl font-bold text-foreground text-center">
        Edit Book
      </h1>

      <p className="text-base text-[#847062] leading-relaxed text-center">
        Update the details of your literary treasure
      </p>
      <EditBookForm bookId={bookId} />
    </div>
  )
}

export default EditBook