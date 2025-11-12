const Breadcrumb = ({ parentCategory, currentCategory }) => {
    return (
        <div className="text-sm text-gray-500 mb-2">
            หมวดหมู่&nbsp;/&nbsp;
            {parentCategory && <>{parentCategory.name}&nbsp;/&nbsp;</>}
            {currentCategory}
        </div>
    );
};

export default Breadcrumb;