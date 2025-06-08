interface RecordLayoutProps {
	header: React.ReactNode;
	mainContent: React.ReactNode[];
	sidebarContent: React.ReactNode[];
}

const RecordLayout: React.FC<RecordLayoutProps> = ({
	header,
	mainContent,
	sidebarContent,
}) => (
	<div className="min-h-screen py-8">
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			{header}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					{mainContent.map((content, index) => (
						<div key={`idx-${index}-${index + 1}`}>{content}</div>
					))}
				</div>
				<div className="space-y-6">
					{sidebarContent.map((content, index) => (
						<div key={`idx-${index}-${index + 1}`}>{content}</div>
					))}
				</div>
			</div>
		</div>
	</div>
);

export default RecordLayout;
